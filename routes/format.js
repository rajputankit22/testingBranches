var analysis = schedule.scheduleJob('*/3 * * * *', function(next){
      console.log("Start analysis data");
      fs.unlink('public/AnalyticData/lenderTotalAmount.csv', function(){
        console.log('File deleted');
      });
  Users.find({'total_lent': { $gte: 0}},function(err , users){
    users.forEach(function(user) {
      var lentAmountAggregate  = [
          {
          $match: {
            'lenderId': new mongoose.Types.ObjectId(user._id),
            '_disbursed': true,
          }
        },
        {
          $group: {
            _id: '',
            total: { $sum: '$amount' }
          }
        },
        {
          $project: {
            _id: 0,
            total: '$total'
          }
        }
      ];

      var runningAmountAggregate  = [
        {
          $match: {
            'lenderId': new mongoose.Types.ObjectId(user._id),
            '_disbursed': true,
          }
        },
        {
          $unwind:'$emi'
        },
        {
          $match: {
            'emi._settled': false,
          }
        },
        {
          $group: {
            _id: '',
            total: { $sum: '$emi.amount' }
          }
        },
        {
          $project: {
            _id: 0,
            total: '$total'
          }
        }
      ];

      var returnsAmountAggregate  = [
        {
          $match: {
            'lenderId': new mongoose.Types.ObjectId(user._id),
            '_disbursed': true,
          }
        },
        {
          $unwind:'$emi'
        },
        {
          $match: {
            'emi._settled': true,
          }
        },
        {
          $group: {
            _id: '',
            total: { $sum: '$emi.amount' }
          }
        }
      ];

      var lastLoanDate  = [
        {
          $match: {
            'lenderId': new mongoose.Types.ObjectId(user._id),
            '_disbursed': true,
            // '_completed': true,
          }
        }
      ];
      Loans.aggregate(lentAmountAggregate,function(err,lentAmount){
        Loans.aggregate(runningAmountAggregate,function(err,runningAmount){
          Loans.aggregate(returnsAmountAggregate,function(err,returnsAmount){
            Loans.count({lenderId:user._id,_disbursed:true,_completed:false},function(err,activeLoans){
              Loans.count({lenderId:user._id,_disbursed:true},function(err,disbursedLoans){
                Loans.aggregate(lastLoanDate,function(err,lentLoans){
                  var lentAmount_ = 0;
                  var runningAmount_ = 0;
                  var returnsAmount_ = 0;
                  var lastLoanDate = NaN;
                  if (lentAmount.length) {
                    var lentAmount_ = lentAmount[0].total;
                  }
                  if (runningAmount.length) {
                    var runningAmount_ = runningAmount[0].total;
                  }
                  if (returnsAmount.length) {
                    var returnsAmount_ = returnsAmount[0].total;
                  }
                  if (lentLoans[lentLoans.length-1]) {
                    lastLoanDate = moment(lentLoans[lentLoans.length-1].disbursed_timestamp).format('DD/MM/YYYY');
                  }
                  console.log(user._id+","+user.name+","+moment(user.doj).format('MM/YYYY')+","+ lentAmount_ +","+ runningAmount_ +","+ returnsAmount_ +","+ activeLoans +","+ disbursedLoans +","+ user.city.replace(/ .*/,'') +","+ lastLoanDate);
                  csvdata = user._id+","+user.name +","+moment(user.doj).format('MM/YYYY')+","+ lentAmount_ +","+ runningAmount_ +","+ returnsAmount_ +","+ activeLoans +","+ disbursedLoans +","+ user.city.replace(/ .*/,'') +","+ lastLoanDate+"\n";
                  fs.appendFile('public/AnalyticData/'+'lenderTotalAmount.csv', csvdata,
                    function(err) {

                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
