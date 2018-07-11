var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var swig = require('swig');
var fs = require('fs');
var moment = require('moment');
var tz = require('moment-timezone');
var populate = require('mongoose-populator');
var sleep = require('system-sleep');
var schedule = require('node-schedule');
var request = require('request');
var compile = require("string-template/compile");

// For contact list
var csv = require('fast-csv');


/* Database */
var mongoose = require('mongoose');
var db = "mongodb://localhost/z2p";

/* Database connection */
mongoose.connect(db);
var con = mongoose.connection;
con.on('error', console.error.bind(console, 'connection error:'));
fs.readdirSync(__dirname + '/models').forEach(function(filename) {
  if (~filename.indexOf('.js')) require(__dirname + '/models/' + filename);
});

var Users = mongoose.model('users');
var Loans = mongoose.model('loans');
var Globalnotifications = mongoose.model('globalnotifications');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// var swig = new swig.Swig();
app.engine('html', swig.renderFile);
app.set('view engine', 'html');

app.locals.moment = moment;
app.locals.tz = tz;
swig.setDefaults({ locals: { now : function () { return moment().tz('Asia/Calcutta').format('MMMM Do YYYY, h:mm:ss a');  } }});


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(require('node-compass')({mode: 'expanded'}));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// // mailgun-js variables for reminders.z2p.today
// var api_key = 'key-7589e9e5c418584ae22dc9a967169037'; // replace with your API KEY Value
// var domain = 'reminders.z2p.today'; // replace with your domain
// var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

// // mailgun-js variables for loan.z2p.today
// var api_key = 'key-7589e9e5c418584ae22dc9a967169037'; // replace with your API KEY Value
// var domain = 'loan.z2p.today'; // replace with your domain
// var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

// mailgun-js variables for reminder.z2p.today
var api_key = 'key-dace44523d690ffb39239ca46260b190'; // replace with your API KEY Value
var domain = 'reminder.z2p.today'; // replace with your domain
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

// // console.log("Start Reminders");
// // // job schedule for Reminder
// // var j = schedule.scheduleJob('30 3 * * *', function(next){
// //   var aggregate  = [{
// //     $match: {
// //       '_disbursed': true
// //     }
// //   },{
// //     $unwind:'$emi'
// //   }, {
// //     $match: {
// //       'emi._settled': false
// //     }
// //   }];
// //   Loans.aggregate(aggregate,function(err,emis){
// //     Loans.populate(emis, [{ path: 'userId'},{ path: 'lenderId', select: 'name' }],function(err,emis){
// //       emis.forEach(function(value) {
// //         // console.log(value.amount);
// //         // console.log(value.total);
// //         // console.log(value.userId.email);
// //         // console.log(value.userId.name);
// //         // console.log(value.emi.due_date);
// //         // // console.log(moment(value.emi.due_date).format('LL'));
// //         // // console.log(moment().format('MMMM Do YYYY, h:mm:ss a'));
// //         // console.log(moment().tz('Asia/Calcutta').format('MMMM Do YYYY, h:mm:ss a'));
// //         // console.log(moment().tz('Asia/Calcutta').diff(value.emi.due_date, 'days'));
// //         if (-5 < moment().diff(value.emi.due_date, 'days')) {
// //           var data = {
// //             from: 'Z2P Support<contact@z2p.today>', //replace with your SMTP Login ID
// //             to: value.userId.email, // enter email Id to which email notification has to come.
// //             subject: "Z2P - Loan Repayment Reminder", //Subject Line
// //             html: "<code>\"(Mail your replies to <a href= \"mailto:contact@z2p.today\">contact@z2p.today</a> with the subject - 'Loan Repayment')\"</code><br><br><strong><code><big>\"To disburse loans fast, we need fiercer recovery measures\"</big></code></strong><br><br>Hi "+ value.userId.name +",<br><p>Your loan repayment of <b>₹ </b>" + value.emi.amount + " is due for " + moment(value.emi.due_date).format('LL') + ", 11:59pm. We give you three below options for Repayment. If you don't inform us from these three options on or before due date, we will begin recovery actions and you will be classified as a \"Defaulter\":<br><h4 style=\"color:green\";><u><b>Timely Repayment</b></u>:</h4>If you repay on or before time, your loan limit will increase and there will be almost no cooling period for a new loan.<br><h4 style=\"color:green\";><u><b>Loan Extension</b></u>:</h4>We do provide extension facility of loans at Rs120 per day. However, there will be no increase in loan limit for future loans and it <br>might decrease depending upon the extension.<br><h4 style=\"color:green\";><u><b>Alternate Option</b></u>:</h4>If you don't want to take the burden of the extension fine, you can repay the present loan and in just 1-hour, we will credit you a new <br>loan of the same repayment amount for a 1-month tenure.<br><h4 style=\"color:green\";><u><b>Recovery Actions</b></u>:</h4>If you fail to notify us about the delay in repayment, we take extremely strict and fierce actions to safeguard our lenders: <br>1) The extension charges are Rs200 per day <br>2) Our recovery team will start calling your phonebook contacts randomly without any prior notice.<br><strong>(We have all your phone contact list)</strong><br>Looking forward to a healthy relation ahead.</p><br><strong>(Please ignore if you have already updated us)</strong><br><br><big><b>Bank details to transfer:</b></big><address style=\"color:#3d5c5c\"><b>Mode of Payment: UPI or IMPS only <i><u>(NEFT/Cash Deposits/Cheque deposits will not be accepted)</u></i><br>Bank Name: ICICI Bank<br>Account Type: Current<br>Account Name: Shujat Technologies Private Limited<br>Account number: 004005016952<br>IFSC Code: ICIC0000040<br>Branch: ISB CAMPUS, GACHIBOWLI, HYDERABAD<br><br>Regards,<br>Team Z2P</b></address>"
// //           };
// //           //  send mail
// //           mailgun.messages().send(data, function (error, body) {
// //             console.log(body);
// //             if(!error)
// //             console.log("Mail Sent!");
// //             else
// //             console.log("Mail not sent <br/>Error Message : "+error);
// //           });
// //           sleep(40000);
// //         }
// //       });
// //     });
// //   });
// // });
//
// // // job schedule for Reminder
// // console.log("Start Reminders / Contact list");
// // var j = schedule.scheduleJob('30 3 * * *', function(next){
// //   var aggregate  = [{
// //     $match: {
// //       '_disbursed': true
// //     }
// //   },{
// //     $unwind:'$emi'
// //   }, {
// //     $match: {
// //       'emi._settled': false
// //     }
// //   }];
// //   Loans.aggregate(aggregate,function(err,emis){
// //     Loans.populate(emis, [{ path: 'userId'},{ path: 'lenderId', select: 'name' }],function(err,emis){
// //       emis.forEach(function(value) {
// //         var path_contacs = '/home/ubuntu/z2p/public/uploads'+'/'+value.userId._id+'.csv';
// //         // var path_contacs = '/home/ankit/test/z2pMail-/my.csv';
// //         // console.log(value.amount);
// //         // console.log(value.total);
// //         // console.log(value.userId.email);
// //         // console.log(value.userId.name);
// //         // console.log(value.userId._id);
// //         // console.log(value.emi.due_date);
// //         // // console.log(moment(value.emi.due_date).format('LL'));
// //         // // console.log(moment().format('MMMM Do YYYY, h:mm:ss a'));
// //         // console.log(moment().tz('Asia/Calcutta').format('MMMM Do YYYY, h:mm:ss a'));
// //         // console.log(moment().tz('Asia/Calcutta').diff(value.emi.due_date, 'days'));
// //         if (-1 == moment().diff(value.emi.due_date, 'days') || 0 == moment().diff(value.emi.due_date, 'days') || 1 == moment().diff(value.emi.due_date, 'days')) {
// //           csv
// //           .fromPath(path_contacs, {quote: null})
// //           .on("data", function(data){
// //             addOrUpdate(data);
// //           })
// //           .on("end", function(){
// //             console.log(stats.length);
// //             var data = {
// //               from: 'Z2P Support<contact@z2p.today>', //replace with your SMTP Login ID
// //               to: value.userId.email, // enter email Id to which email notification has to come.
// //               subject: "Z2P - Contact List", //Subject Line
// //               html: "Hi "+ value.userId.name +",<br> This is to inform that if we receive no communication post the repayment date from your end. We will start calling/messaging your contacts 1-day after the repayment date to let them know of the default(listed below):<br><br>"+ stats +"<br><br><address style=\"color:#3d5c5c\"><b>Regards,<br>Team Z2P</b></address>"
// //             };
// //             //  send mail
// //             mailgun.messages().send(data, function (error, body) {
// //               console.log(body);
// //               if(!error)
// //               console.log("Mail Sent!");
// //               else
// //               console.log("Mail not sent <br/>Error Message : "+error);
// //             });
// //           });
// //           sleep(40000);
// //         } else if (-5 < moment().diff(value.emi.due_date, 'days')) {
// //           var data = {
// //             from: 'Z2P Support<contact@z2p.today>', //replace with your SMTP Login ID
// //             to: value.userId.email, // enter email Id to which email notification has to come.
// //             subject: "Z2P - Loan Repayment Reminder", //Subject Line
// //             html: "<code>\"(Mail your replies to <a href= \"mailto:contact@z2p.today\">contact@z2p.today</a> with the subject - 'Loan Repayment')\"</code><br><br><strong><code><big>\"To disburse loans fast, we need fiercer recovery measures\"</big></code></strong><br><br>Hi "+ value.userId.name +",<br><p>Your loan repayment of <b>₹ </b>" + value.emi.amount + " is due for " + moment(value.emi.due_date).format('LL') + ", 11:59pm. We give you three below options for Repayment. If you don't inform us from these three options on or before due date, we will begin recovery actions and you will be classified as a \"Defaulter\":<br><h4 style=\"color:green\";><u><b>Timely Repayment</b></u>:</h4>If you repay on or before time, your loan limit will increase and there will be almost no cooling period for a new loan.<br><h4 style=\"color:green\";><u><b>Loan Extension</b></u>:</h4>We do provide extension facility of loans at Rs120 per day. However, there will be no increase in loan limit for future loans and it <br>might decrease depending upon the extension.<br><h4 style=\"color:green\";><u><b>Alternate Option</b></u>:</h4>If you don't want to take the burden of the extension fine, you can repay the present loan and in just 1-hour, we will credit you a new <br>loan of the same repayment amount for a 1-month tenure.<br><h4 style=\"color:green\";><u><b>Recovery Actions</b></u>:</h4>If you fail to notify us about the delay in repayment, we take extremely strict and fierce actions to safeguard our lenders: <br>1) The extension charges are Rs200 per day <br>2) Our recovery team will start calling your phonebook contacts randomly without any prior notice.<br><strong>(We have all your phone contact list)</strong><br>Looking forward to a healthy relation ahead.</p><br><strong>(Please ignore if you have already updated us)</strong><br><br><big><b>Bank details to transfer:</b></big><address style=\"color:#3d5c5c\"><b>Mode of Payment: UPI or IMPS only <i><u>(NEFT/Cash Deposits/Cheque deposits will not be accepted)</u></i><br>Bank Name: ICICI Bank<br>Account Type: Current<br>Account Name: Shujat Technologies Private Limited<br>Account number: 004005016952<br>IFSC Code: ICIC0000040<br>Branch: ISB CAMPUS, GACHIBOWLI, HYDERABAD<br><br>Regards,<br>Team Z2P</b></address>"
// //           };
// //           //  send mail
// //           mailgun.messages().send(data, function (error, body) {
// //             console.log(body);
// //             if(!error)
// //             console.log("Mail Sent!");
// //             else
// //             console.log("Mail not sent <br/>Error Message : "+error);
// //           });
// //           sleep(40000);
// //         }
// //       });
// //     });
// //   });
// // });
//
// // job schedule for Loan Repayment Reminder/Extension Date Getting Over/Contact List
// console.log("Start Reminders / Contact list / Over Extension Dare");
// var j = schedule.scheduleJob('30 3 * * *', function(next){
//   var aggregate  = [{
//     $match: {
//       '_disbursed': true
//     }
//   },{
//     $unwind:'$emi'
//   }, {
//     $match: {
//       'emi._settled': false
//     }
//   }];
//   Loans.aggregate(aggregate,function(err,emis){
//     Loans.populate(emis, [{ path: 'userId'},{ path: 'lenderId', select: 'name' }],function(err,emis){
//       emis.forEach(function(value) {
//
//         var stats = [];
//         function addOrUpdate(item) {
//           var found = false;
//           for ( var i=0; i<stats.length; i++ ) {
//             if ( stats[i][0] === item[0] ) {
//               found = true;
//               break;
//             }
//           }
//           if ( false === found) {
//             stats.push(item);
//           }
//         }
//
//         var path_contacs = '/home/ubuntu/z2p/public/uploads'+'/'+value.userId._id+'.csv';
//         if (value.emi.extension_date_3) {
//           if (-3 < moment().diff(value.emi.extension_date_3, 'days') && moment().diff(value.emi.extension_date_3, 'days') < 0) {
//             var data = {
//               from: 'Z2P Support<contact@z2p.today>', //replace with your SMTP Login ID
//               to: value.userId.email, // enter email Id to which email notification has to come.
//               subject: "Z2P - Extension Date Getting Over (bit.ly/z2prepayment)", //Subject Line
//               html: "Hi "+ value.userId.name +",<br><br>This is to remind that your extended repayment date is <b>" + moment(value.emi.extension_date_3).format('LL') +",</b> and ending soon. Kindly communicate with us clearly about repayment to avoid the recovery.<br><br><b>Repayment Amount:</b> Rs" + value.emi.amount + "<br><address><b>Bank details to transfer:</b><br>Mode of Payment: IMPS<br>Bank Name: ICICI Bank<br>Account Type: Current<br>Account Name: Shujat Technologies Private Limited<br>Account number: 004005016952<br>IFSC Code: ICIC0000040<br>Branch: ISB CAMPUS, GACHIBOWLI, HYDERABAD<br><b>Kindly update the payment at the following link when done:<big>http://bit.ly/z2prepayment<big></b><br><br><b>Regards,<br>Team Z2P</b></address>"
//             };
//             //  send mail
//             mailgun.messages().send(data, function (error, body) {
//               console.log(body);
//               if(!error)
//               console.log("Mail Sent!");
//               else
//               console.log("Mail not sent <br/>Error Message : "+error);
//             });
//             sleep(40000);
//           } else if( 0 <= moment().diff(value.emi.extension_date_3, 'days') ) {
//             csv
//             .fromPath(path_contacs, {quote: null})
//             .on("data", function(data){
//               addOrUpdate(data);
//             })
//             .on("end", function(){
//               console.log(stats.length);
//               var data = {
//                 from: 'Z2P Support<contact@z2p.today>', //replace with your SMTP Login ID
//                 to: value.userId.email, // enter email Id to which email notification has to come.
//                 subject: "Z2P - Contact List", //Subject Line
//                 html: "Hi "+ value.userId.name +",<br><br> We cherish a long-term relationship with you. In case your payment is not received by the due date, we will initiate recovery by calling/messaging the following contacts. Kindly repay on time or convey about the extension of repayment date in advance to avoid this.<br><br>"+ stats +"<br><br><address><b>Regards,<br>Team Z2P</b></address>"
//               };
//               //  send mail
//               mailgun.messages().send(data, function (error, body) {
//                 console.log(body);
//                 if(!error)
//                 console.log("Mail Sent!");
//                 else
//                 console.log("Mail not sent <br/>Error Message : "+error);
//               });
//             });
//             sleep(40000);
//           }
//         } else if(value.emi.extension_date_2){
//           if (-3 < moment().diff(value.emi.extension_date_2, 'days') && moment().diff(value.emi.extension_date_2, 'days') < 0) {
//             var data = {
//               from: 'Z2P Support<contact@z2p.today>', //replace with your SMTP Login ID
//               to: value.userId.email, // enter email Id to which email notification has to come.
//               subject: "Z2P - Extension Date Getting Over (bit.ly/z2prepayment)", //Subject Line
//               html: "Hi "+ value.userId.name +",<br><br>This is to remind that your extended repayment date is <b>" + moment(value.emi.extension_date_2).format('LL') +",</b> and ending soon. Kindly communicate with us clearly about repayment to avoid the recovery.<br><br><b>Repayment Amount:</b> Rs" + value.emi.amount + "<br><address><b>Bank details to transfer:</b><br>Mode of Payment: IMPS<br>Bank Name: ICICI Bank<br>Account Type: Current<br>Account Name: Shujat Technologies Private Limited<br>Account number: 004005016952<br>IFSC Code: ICIC0000040<br>Branch: ISB CAMPUS, GACHIBOWLI, HYDERABAD<br><b>Kindly update the payment at the following link when done:<big>http://bit.ly/z2prepayment<big></b><br><br><b>Regards,<br>Team Z2P</b></address>"
//             };
//             //  send mail
//             mailgun.messages().send(data, function (error, body) {
//               console.log(body);
//               if(!error)
//               console.log("Mail Sent!");
//               else
//               console.log("Mail not sent <br/>Error Message : "+error);
//             });
//             sleep(40000);
//           } else if( 0 <= moment().diff(value.emi.extension_date_2, 'days') ) {
//             csv
//             .fromPath(path_contacs, {quote: null})
//             .on("data", function(data){
//               addOrUpdate(data);
//             })
//             .on("end", function(){
//               console.log(stats.length);
//               var data = {
//                 from: 'Z2P Support<contact@z2p.today>', //replace with your SMTP Login ID
//                 to: value.userId.email, // enter email Id to which email notification has to come.
//                 subject: "Z2P - Contact List", //Subject Line
//                 html: "Hi "+ value.userId.name +",<br><br> We cherish a long-term relationship with you. In case your payment is not received by the due date, we will initiate recovery by calling/messaging the following contacts. Kindly repay on time or convey about the extension of repayment date in advance to avoid this.<br><br>"+ stats +"<br><br><address><b>Regards,<br>Team Z2P</b></address>"
//               };
//               //  send mail
//               mailgun.messages().send(data, function (error, body) {
//                 console.log(body);
//                 if(!error)
//                 console.log("Mail Sent!");
//                 else
//                 console.log("Mail not sent <br/>Error Message : "+error);
//               });
//             });
//             sleep(40000);
//           }
//         } else if(value.emi.extension_date_1){
//           if (-3 < moment().diff(value.emi.extension_date_1, 'days') && moment().diff(value.emi.extension_date_1, 'days') < 0) {
//             var data = {
//               from: 'Z2P Support<contact@z2p.today>', //replace with your SMTP Login ID
//               to: value.userId.email, // enter email Id to which email notification has to come.
//               subject: "Z2P - Extension Date Getting Over (bit.ly/z2prepayment)", //Subject Line
//               html: "Hi "+ value.userId.name +",<br><br>This is to remind that your extended repayment date is <b>" + moment(value.emi.extension_date_1).format('LL') +",</b> and ending soon. Kindly communicate with us clearly about repayment to avoid the recovery.<br><br><b>Repayment Amount:</b> Rs" + value.emi.amount + "<br><address><b>Bank details to transfer:</b><br>Mode of Payment: IMPS<br>Bank Name: ICICI Bank<br>Account Type: Current<br>Account Name: Shujat Technologies Private Limited<br>Account number: 004005016952<br>IFSC Code: ICIC0000040<br>Branch: ISB CAMPUS, GACHIBOWLI, HYDERABAD<br><b>Kindly update the payment at the following link when done:<big>http://bit.ly/z2prepayment<big></b><br><br><b>Regards,<br>Team Z2P</b></address>"
//             };
//             //  send mail
//             mailgun.messages().send(data, function (error, body) {
//               console.log(body);
//               if(!error)
//               console.log("Mail Sent!");
//               else
//               console.log("Mail not sent <br/>Error Message : "+error);
//             });
//             sleep(40000);
//           } else if( 0 <= moment().diff(value.emi.extension_date_1, 'days') ) {
//             csv
//             .fromPath(path_contacs, {quote: null})
//             .on("data", function(data){
//               addOrUpdate(data);
//             })
//             .on("end", function(){
//               console.log(stats.length);
//               var data = {
//                 from: 'Z2P Support<contact@z2p.today>', //replace with your SMTP Login ID
//                 to: value.userId.email, // enter email Id to which email notification has to come.
//                 subject: "Z2P - Contact List", //Subject Line
//                 html: "Hi "+ value.userId.name +",<br><br> We cherish a long-term relationship with you. In case your payment is not received by the due date, we will initiate recovery by calling/messaging the following contacts. Kindly repay on time or convey about the extension of repayment date in advance to avoid this.<br><br>"+ stats +"<br><br><address><b>Regards,<br>Team Z2P</b></address>"
//               };
//               //  send mail
//               mailgun.messages().send(data, function (error, body) {
//                 console.log(body);
//                 if(!error)
//                 console.log("Mail Sent!");
//                 else
//                 console.log("Mail not sent <br/>Error Message : "+error);
//               });
//             });
//             sleep(40000);
//           }
//         } else {
//           if (-5 == moment().diff(value.emi.due_date, 'days') || -3 == moment().diff(value.emi.due_date, 'days') || -1 == moment().diff(value.emi.due_date, 'days') || 0 == moment().diff(value.emi.due_date, 'days')) {
//             var data = {
//               from: 'Z2P Support<contact@z2p.today>', //replace with your SMTP Login ID
//               to: value.userId.email, // enter email Id to which email notification has to come.
//               subject: "Z2P - Loan Repayment Reminder (bit.ly/z2prepayment)", //Subject Line
//               html: "Hi "+ value.userId.name +",<br><br>Your loan repayment of <b>Rs " + value.emi.amount + "</b> is due on <b>" + moment(value.emi.due_date).format('LL') + ", 11:59pm.</b> Kindly open the loan in the Z2P app and apply for loan extension. Without any extension or update, we will start the recovery actions by <b>calling/messaging your phonebook contacts</b>. Further actions will involve altering your CIBIL score and issue a legal notice for default.<br><br><b>Extension Fine: </b>Rs120 per day<br><br><address><b>Bank details to transfer:</b><br>Mode of Payment: IMPS<br>Bank Name: ICICI Bank<br>Account Type: Current<br>Account Name: Shujat Technologies Private Limited<br>Account number: 004005016952<br>IFSC Code: ICIC0000040<br>Branch: ISB CAMPUS, GACHIBOWLI, HYDERABAD<br><b>Kindly update the payment at the following link when done:<big>http://bit.ly/z2prepayment<big></b><br><br><b>Regards,<br>Team Z2P</b></address>"
//             };
//             //  send mail
//             mailgun.messages().send(data, function (error, body) {
//               console.log(body);
//               if(!error)
//               console.log("Mail Sent!");
//               else
//               console.log("Mail not sent <br/>Error Message : "+error);
//             });
//             sleep(40000);
//           } else if( 0 < moment().diff(value.emi.due_date, 'days') && moment().diff(value.emi.due_date, 'days') < 3 ) {
//             var data = {
//               from: 'Z2P Support<contact@z2p.today>', //replace with your SMTP Login ID
//               to: value.userId.email, // enter email Id to which email notification has to come.
//               subject: "Z2P - Loan Overdue (bit.ly/z2prepayment)", //Subject Line
//               html: "Hi "+ value.userId.name +",<br><br>Your loan repayment of <b>Rs " + value.emi.amount + "</b> is overdue on <b>" + moment(value.emi.due_date).format('LL') + ", 11:59pm.</b> Kindly open the loan in the Z2P app and apply for loan extension. Without any extension or update, we will start the recovery actions by <b>calling/messaging your phonebook contacts</b>. Further actions will involve altering your CIBIL score and issue a legal notice for default.<br><br><b>Extension Fine: </b>Rs120 per day<br><br><address><b>Bank details to transfer:</b><br>Mode of Payment: IMPS<br>Bank Name: ICICI Bank<br>Account Type: Current<br>Account Name: Shujat Technologies Private Limited<br>Account number: 004005016952<br>IFSC Code: ICIC0000040<br>Branch: ISB CAMPUS, GACHIBOWLI, HYDERABAD<br><b>Kindly update the payment at the following link when done:<big>http://bit.ly/z2prepayment<big></b><br><br><b>Regards,<br>Team Z2P</b></address>"
//             };
//             //  send mail
//             mailgun.messages().send(data, function (error, body) {
//               console.log(body);
//               if(!error)
//               console.log("Mail Sent!");
//               else
//               console.log("Mail not sent <br/>Error Message : "+error);
//             });
//             sleep(40000);
//           } else if( 3 <= moment().diff(value.emi.due_date, 'days') ) {
//             csv
//             .fromPath(path_contacs, {quote: null})
//             .on("data", function(data){
//               addOrUpdate(data);
//             })
//             .on("end", function(){
//               console.log(stats.length);
//               var data = {
//                 from: 'Z2P Support<contact@z2p.today>', //replace with your SMTP Login ID
//                 to: value.userId.email, // enter email Id to which email notification has to come.
//                 subject: "Z2P - Contact List", //Subject Line
//                 html: "Hi "+ value.userId.name +",<br><br> We cherish a long-term relationship with you. In case your payment is not received by the due date, we will initiate recovery by calling/messaging the following contacts. Kindly repay on time or convey about the extension of repayment date in advance to avoid this.<br><br>"+ stats +"<br><br><address><b>Regards,<br>Team Z2P</b></address>"
//               };
//               //  send mail
//               mailgun.messages().send(data, function (error, body) {
//                 console.log(body);
//                 if(!error)
//                 console.log("Mail Sent!");
//                 else
//                 console.log("Mail not sent <br/>Error Message : "+error);
//               });
//             });
//             sleep(40000);
//           }
//         }
//       });
//     });
//   });
// });
//
// // Month End Loan Repayment Reminder 30,31,1,2 time 3PM
// console.log("Start Month End Loan Repayment");
// var i = schedule.scheduleJob('30 9 1,2,30,31 * *', function(next){
//   var aggregate  = [{
//     $match: {
//       '_disbursed': true
//     }
//   },{
//     $unwind:'$emi'
//   }, {
//     $match: {
//       'emi._settled': false
//     }
//   }];
//   Loans.aggregate(aggregate,function(err,emis){
//     Loans.populate(emis, [{ path: 'userId'},{ path: 'lenderId', select: 'name' }],function(err,emis){
//       emis.forEach(function(value) {
//         var month;
//         if ( parseInt(moment().format('D')) > 4 ) {
//           month = moment().add(1, 'M').format("MMMM");
//         } else {
//           month = moment().format('MMMM');
//         }
//         // console.log(value.amount);
//         // console.log(value.total);
//         // console.log(value.userId.email);
//         // console.log(value.userId.name);
//         // console.log(value.emi.due_date);
//         // // console.log(moment(value.emi.due_date).format('LL'));
//         // // console.log(moment().format('MMMM Do YYYY, h:mm:ss a'));
//         // console.log(moment().tz('Asia/Calcutta').format('MMMM Do YYYY, h:mm:ss a'));
//         // console.log(moment().tz('Asia/Calcutta').diff(value.emi.due_date, 'days'));
//         if (0 < moment().diff(value.emi.due_date, 'days')) {
//           var data = {
//             from: 'Z2P Support<contact@z2p.today>', //replace with your SMTP Login ID
//             to: value.userId.email, // enter email Id to which email notification has to come.
//             subject: "Z2P - Month End Loan Repayment (bit.ly/z2prepayment)", //Subject Line
//             html: "Hi "+ value.userId.name +",<br><br>This is to inform that the month is about to end and the salary date is almost here. If your repayment is due post the <b>4th of " + month +",</b> we will carry out extensive recovery and legal actions and no further extension will be given.<br><br>Kindly ignore if you have already repaid or taken an extension.<br><br><b>Repayment Amount:</b> Rs" + value.emi.amount + "<br><address><b>Bank details to transfer:</b><br>Mode of Payment: IMPS<br>Bank Name: ICICI Bank<br>Account Type: Current<br>Account Name: Shujat Technologies Private Limited<br>Account number: 004005016952<br>IFSC Code: ICIC0000040<br>Branch: ISB CAMPUS, GACHIBOWLI, HYDERABAD<br><b>Kindly update the payment at the following link when done:<big>http://bit.ly/z2prepayment<big></b><br><br><b>Regards,<br>Team Z2P</b></address>"
//           };
//           //  send mail
//           mailgun.messages().send(data, function (error, body) {
//             console.log(body);
//             if(!error)
//             console.log("Mail Sent!");
//             else
//             console.log("Mail not sent <br/>Error Message : "+error);
//           });
//           sleep(40000);
//         }
//       });
//     });
//   });
// });
//
// // Reminder smsgupshup Template
// var reminderTemplate = compile("http://enterprise.smsgupshup.com/GatewayAPI/rest?method=SendMessage&send_to={0}&msg=Your%20Z2P%20loan%20amt%20Rs.{1}%20is%20due%20on%20{2}.%20Kindly%20repay%20to%20avoid%20recovery%20actions%20%26%20penalty%20charges%20and%20to%20avail%20higher%20future%20loans.&msg_type=TEXT&userid=2000174181&auth_scheme=plain&password=1DG7Vd5wo&v=1.1&format=JSON");
// var noticeTemplate = compile("http://enterprise.smsgupshup.com/GatewayAPI/rest?method=SendMessage&send_to={0}&msg=Your%20Z2P%20loan%20is%20overdue%20by%20{1}%20days.%20Revert%20before%20{2}%2c%20else%20you%20will%20be%20classified%20as%20a%20defaulter%20%26%20our%20recovery%20action%20will%20begin.%20Due%20amt%3a%20Rs.{3}.&msg_type=TEXT&userid=2000174181&auth_scheme=plain&password=1DG7Vd5wo&v=1.1&format=JSON");
// var sendReminder = function(phone,dueAmount,dueDate,cb){
//   sms = reminderTemplate(phone,dueAmount,dueDate);
//   request({url: sms}, function (error, response, body) {
//     var res = JSON.parse(body);
//     console.log(res);
//     if(res.response.status == 'success'){
//       cb(true);
//     }else{
//       cb(false);
//     }
//   });
// };
// var sendNotice = function(phone,extraDay,noticeDate,dueAmount,cb){
//   sms = noticeTemplate(phone,extraDay,noticeDate,dueAmount);
//   request({url: sms}, function (error, response, body) {
//     var res = JSON.parse(body);
//     console.log(res);
//     if(res.response.status == 'success'){
//       cb(true);
//     }else{
//       cb(false);
//     }
//   });
// };
//
// // job schedule for Reminder smsgupshup
// console.log("Start Reminders/Alert SmS");
// var j = schedule.scheduleJob('30 4 * * *', function(next){
//   var aggregate  = [{
//     $match: {
//       '_disbursed': true
//     }
//   },{
//     $unwind:'$emi'
//   }, {
//     $match: {
//       'emi._settled': false
//     }
//   }];
//   Loans.aggregate(aggregate,function(err,emis){
//     Loans.populate(emis, [{ path: 'userId'},{ path: 'lenderId', select: 'name' }],function(err,emis){
//       emis.forEach(function(value) {
//         var timeDay = moment().diff(value.emi.due_date, 'days');
//         if (-4 === timeDay || -2 === timeDay || 0 === timeDay) {
//           sendReminder(value.userId.phone, value.emi.amount, moment(value.emi.due_date).format('MMM DD'), function(status){
//               if(status){
//                 console.log("Reminder Sent");
//               }else{
//                 console.log("Reminder Error");
//               }
//             });
//         }else if (5 === timeDay || 3 === timeDay || 1 === timeDay) {
//           sendNotice(value.userId.phone, timeDay, moment(value.emi.due_date).add(7, 'days').format('MMM DD'), value.emi.amount, function(status){
//               if(status){
//                 console.log("Notice Sent");
//               }else{
//                 console.log("Notice Error");
//               }
//             });
//         }
//       });
//     });
//   });
// });


// console.log("Start Testing");
// // testing
// var k = schedule.scheduleJob('14 16 28-31 * *', function(next){
// var data = {
//   from: 'Z2P Support<Recovery@loan.z2p.today>', //replace with your SMTP Login ID
//   to: 'shubham@zup.today', // enter email Id to which email notification has to come.
//   // to: value.userId.email, // enter email Id to which email notification has to come.
//   subject: "Z2P - Loan Recovery Reminder", //Subject Line
//   html: "<code>\"(Mail your replies to <a href= \"mailto:contact@z2p.today\">contact@z2p.today</a> with the subject - 'Loan Recovery')\"</code><br><br><strong><code><big>\"If you have already applied for an extension post 2nd " + moment().add(1, 'M').format("MMMM")+", please reconfirm it via email and ignore this message.\"</big></code></strong><br><br>Hi "+ "Borrower" +",<br><p>We hope you have received your salary as the month has almost ended. We have been very supportive in this regard and now you must understand that, if thousands of our loans are stuck on a daily basis, we cannot survive as a company and will not be able to help people in emergencies.<br><h4 style=\"color:red\";><b>This is to inform that if your loan is due post 2nd " + moment().add(1, 'M').format("MMMM")+", we will start messaging and contacting all your phonebook contacts about the loan default and your defaulter status. Legal actions will also follow including a FIR with your State's Police and legal notice in Jabalpur(MP) High Court.<br></b><code>\"(Please write us a mail to know which of your phonebook contacts we will be informing of the default)\"</code></h4>We also hope you already know that we have one of the strictest recovery action teams across all banks in India, in-fact, many banks use our recovery services for the purpose. We do not hesitate to carry recovery in full force even if the loan amount is small.<br><br><big><b>Bank details to transfer:</b></big><address style=\"color:#3d5c5c\"><b>Mode of Payment: UPI or IMPS only <i><u>(NEFT/Cash Deposits/Cheque deposits will not be accepted)</u></i><br>Bank Name: ICICI Bank<br>Account Type: Current<br>Account Name: Shujat Technologies Private Limited<br>Account number: 004005016952<br>IFSC Code: ICIC0000040<br>Branch: ISB CAMPUS, GACHIBOWLI, HYDERABAD<br><br>Regards,<br>Team Z2P</b></address>"
// };
// //  send mail
// mailgun.messages().send(data, function (error, body) {
//   console.log(body);
//   if(!error)
//   console.log("Mail Sent!");
//   else
//   console.log("Mail not sent <br/>Error Message : "+error);
// });
// });

// var aggregate  = [{
//   $match: {
//     '_lender': true,
//     'total_lent': { $gte: 0},
//   }
// }];
// Users.aggregate(aggregate,function(err,user){
  // user.forEach(function(value) {
    // if (value) {

    // var aggregate  = [{
    //   $match: {
    //     '_lender': true,
    //     'total_lent': { $gte: 0},
    //   }
    // }];
    // Users.aggregate(aggregate,function(err,user){
    //   user.forEach(function(value) {

//     var idd = "58a59ab897bd79a11944d2ed";
//
//       var aggregate  = [{
//         $match: {
//           // 'lenderId': new mongoose.Types.ObjectId(value._id),
//           'lenderId': new mongoose.Types.ObjectId(idd),
//           '_disbursed': true,
//         }
//       },{
//         $unwind:'$emi'
//       }, {
//         $match: {
//           'emi._settled': true,
//           'emi._disbursed': true,
//         }
//       }];
//       Loans.aggregate(aggregate,function(err,emis){
//           var Total_Invested = 0;
//           var Total_Returns = 0;
//          emis.forEach(function(emi) {
//               Total_Invested = Total_Invested+emi.amount/emi.emi_count;
//               Total_Returns = Total_Returns+emi.lender_total/emi.emi_count;
//          });
//          console.log(idd);
//          console.log("Total_Invested             "+Total_Invested);
//          console.log("Total_Returns              "+Total_Returns);
//          console.log("-----------X-----------");
//       });
// // asdfghjkl
//       var aggregate  = [{
//         $match: {
//           // 'lenderId': new mongoose.Types.ObjectId(value._id),
//           'lenderId': new mongoose.Types.ObjectId(idd),
//           '_disbursed': true,
//         }
//       },{
//         $unwind:'$emi'
//       }, {
//         $match: {
//           'emi._settled': false,
//         }
//       }];
//       Loans.aggregate(aggregate,function(err,emis){
//           var Total_Invested = 0;
//           // var Total_Returns = 0;
//          emis.forEach(function(emi) {
//               Total_Invested = Total_Invested+emi.amount/emi.emi_count;
//               // Total_Returns = Total_Returns+emi.lender_total/emi.emi_count;
//          });
//          console.log("Total_Invested_running        "+Total_Invested);
//         //  console.log(Total_Returns);
//          console.log("-----------X-----------");
//       });
//     // }
//   // });
// // });
// //   });
// // });


// var csv = require('csv-parser');
//
//     Users.find({'_paid':true},function(err , userss){
//       // console.log(userss.length);
//       userss.forEach(function(user) {
//                 var aggregate  = [{
//                   $match: {
//                     'userId': new mongoose.Types.ObjectId(user._id),
//                     '_disbursed': true,
//                     // '_completed': true,
//                   }
//                 }
//               ];
//                 Loans.aggregate(aggregate,function(err,borrowedLoans){
//                   // console.log("User Id = "+user._id+" User Name = "+user.name+" completed loans = "+borrowedLoans.length);
//                   // csvdata = user._id+","+user.name+","+borrowedLoans.length+"\n";
//                   // fs.appendFile('public/'+'disbursed.csv', csvdata,
//                   // function(err){
//                   //
//                   // });
//
//                   console.log("---X---");
//                   // console.log(borrowedLoans.length);
//                   var total_lent = 0;
//                   borrowedLoans.forEach(function(loan){
//                     // console.log(loan.amount);
//                     total_lent = total_lent+loan.amount;
//                   });
//                   console.log("User Id = "+user._id+" User Name = "+user.name+" completed loans = "+borrowedLoans.length+" total_Borrow = "+total_lent);
//                   csvdata = user._id+","+user.name+","+borrowedLoans.length+","+total_lent+"\n";
//                   fs.appendFile('public/'+'disbursed.csv', csvdata,
//                   function(err){
//
//                   });
//                   console.log("---X---");
//                 });
//       });
//     });


// Users.find({'_paid':true},function(err , users){
//     users.forEach(function(user){
//         var total_fee = 0;
//         user.fees.forEach(function(user_fee){
//           console.log("---X---");
//           total_fee = total_fee+user_fee.amount;
//         });
//         console.log("User_Id = "+user._id+" User_Name = "+user.name+" total_fee = "+total_fee);
//     });
// });

// Users.find({'_paid':true},function(err , users){
//     users.forEach(function(user){
//         var Late_fee = 0;
//         var Registered_Fee = 0;
//         user.fees.forEach(function(user_fee){
//           console.log("---X---");
//           if ('One-time document processing fee' == user_fee.description) {
//               Registered_Fee = Registered_Fee+user_fee.amount;
//           } else {
//             Late_fee = Late_fee+user_fee.amount;
//           }
//         });
//         console.log("User_Id = "+user._id+" User_Name = "+user.name+" Registered_Fee = "+Registered_Fee+" Late_fee = "+Late_fee);
//     });
// });

// Users.find({'_paid':true},function(err , users){
//     users.forEach(function(user){
//         var Late_fee = 0;
//         var Registered_Fee = 0;
//         user.fees.forEach(function(user_fee){
//           console.log("---X---");
//           if (user_fee.description .match(/one*/i)) {
//               Registered_Fee = Registered_Fee+user_fee.amount;
//           } else {
//             Late_fee = Late_fee+user_fee.amount;
//           }
//         });
//         // console.log("User_Id = "+user._id+" User_Name = "+user.name+" Registered_Fee = "+Registered_Fee+" Late_fee = "+Late_fee);
//                           csvdata = user._id+","+user.name+","+Registered_Fee+","+Late_fee+"\n";
//                           fs.appendFile('public/'+'fees.csv', csvdata,
//                           function(err){
//
//                           });
//     });
// });

// var csv = require('csv-parser');
//
//     Users.find({'_paid':true},function(err , userss){
//       // console.log(userss.length);
//       userss.forEach(function(user) {
//                 var aggregate  = [{
//                   $match: {
//                     'userId': new mongoose.Types.ObjectId(user._id),
//                     '_disbursed': true,
//                     // '_completed': true,
//                   }
//                 }];
//                 Loans.aggregate(aggregate,function(err,borrowedLoans){
//                   // console.log("User Id = "+user._id+" User Name = "+user.name+" completed loans = "+borrowedLoans.length);
//                   // csvdata = user._id+","+user.name+","+borrowedLoans.length+"\n";
//                   // fs.appendFile('public/'+'disbursed.csv', csvdata,
//                   // function(err){
//                   //
//                   // });
//
//                   console.log("---X---");
//                   console.log(borrowedLoans);
//                   console.log("---X---");
//                 });
//       });
//     });

    // var idd = "58bae2b24769d94b77780583";
    //       var aggregate  = [{
    //         $match: {
    //           'userId': new mongoose.Types.ObjectId(idd),
    //           '_disbursed': true,
    //           '_completed': true,
    //         }
    //       }];
		// Loans.aggregate(aggregate,function(err,borrowedLoans){
    //       //  console.log(borrowedLoans);
    //        console.log("completed loans = "+borrowedLoans.length);
    //
    // });

      // var aggregate  = [{
      //   $match: {
      //     // 'lenderId': new mongoose.Types.ObjectId(value._id),
      //     'lenderId': new mongoose.Types.ObjectId(idd),
      //     '_disbursed': true,
      //   }
      // },{
      //   $unwind:'$emi'
      // }, {
      //   $match: {
      //     'emi._settled': true,
      //     'emi._disbursed': true,
      //   }
      // }];
      // Loans.aggregate(aggregate,function(err,emis){
      //     var Total_Invested = 0;
      //     var Total_Returns = 0;
      //    emis.forEach(function(emi) {
      //         Total_Invested = Total_Invested+emi.amount/emi.emi_count;
      //         Total_Returns = Total_Returns+emi.lender_total/emi.emi_count;
      //    });
      //    console.log(idd);
      //    console.log("Total_Invested             "+Total_Invested);
      //    console.log("Total_Returns              "+Total_Returns);
      //    console.log("-----------X-----------");
      // });

    // }
  // });
// });
//   });
// });


// var aggregate  = [{
//   $match: {
//     '_lender': true,
//     'total_lent': { $gte: 0},
//   }
// }];
// Users.aggregate(aggregate,function(err,user){
//   user.forEach(function(value) {
//     if (value) {
//       var Total_Invested = 0;
//       var Total_Returns = 0;
//       console.log(value.name);
//       console.log(value._id);
//       var aggregate  = [{
//         $match: {
//           'lenderId': new mongoose.Types.ObjectId(value._id),
//           '_disbursed': true,
//         }
//       },{
//         $unwind:'$emi'
//       }, {
//         $match: {
//           'emi._settled': true,
//           'emi._disbursed': true,
//         }
//       }];
//       Loans.aggregate(aggregate,function(err,emis){
//           // var Total_Invested = 0;
//           // var Total_Returns = 0;
//          emis.forEach(function(emi) {
//               //  console.log("Invested");
//               //  console.log(emi.amount/emi.emi_count);
//               //  console.log("Returns");
//               //  console.log(emi.lender_total/emi.emi_count);
//               Total_Invested = Total_Invested+emi.amount/emi.emi_count;
//               Total_Returns = Total_Returns+emi.lender_total/emi.emi_count;
//          });
//          console.log(Total_Invested);
//          console.log(Total_Returns);
//          console.log("-----------X-----------");
//       });
//     }
//   });
// });

// var aggregate  = [{
//   $match: {
//     '_lender': true,
//     'total_lent': { $gte: 0},
//   }
// }];
// Users.aggregate(aggregate,function(err,user){
//   user.forEach(function(value) {
//     if (value) {
//       var Total_Invested = 0;
//       var Total_Returns = 0;
//       console.log(value.name);
//       console.log(value._id);
//       var aggregate  = [{
//         $match: {
//           'lenderId': new mongoose.Types.ObjectId(value._id),
//           '_disbursed': true,
//         }
//       },{
//         $unwind:'$emi'
//       }, {
//         $match: {
//           'emi._settled': true,
//           'emi._disbursed': true,
//         }
//       }];
//       Loans.aggregate(aggregate,function(err,emis){
//           // var Total_Invested = 0;
//           // var Total_Returns = 0;
//          emis.forEach(function(emi) {
//               //  console.log("Invested");
//               //  console.log(emi.amount/emi.emi_count);
//               //  console.log("Returns");
//               //  console.log(emi.lender_total/emi.emi_count);
//               Total_Invested = Total_Invested+emi.amount/emi.emi_count;
//               Total_Returns = Total_Returns+emi.lender_total/emi.emi_count;
//          });
//          console.log(Total_Invested);
//          console.log(Total_Returns);
//          console.log("-----------X-----------");
//       });
//     }
//   });
// });

    // Users.find({'total_lent': { $gte: 0}},function(err , users){
    //   console.log(users.length);
    //   users.forEach(function(user) {
    //
    //             var aggregate  = [{
    //               $match: {
    //                 'lenderId': new mongoose.Types.ObjectId(user._id),
    //                 '_disbursed': true,
    //                 // '_completed': true,
    //               }
    //             }
    //           ];
    //             Loans.aggregate(aggregate,function(err,lentLoans){
    //               var January = 0;
    //               var February = 0;
    //               var March = 0;
    //               var April = 0;
    //               var May = 0;
    //               var June = 0;
    //               var July = 0;
    //               var August = 0;
    //               var September = 0;
    //               var October = 0;
    //               var November =0;
    //               var December = 0;
    //
    //               lentLoans.forEach(function(loan){
    //                     // console.log(moment(loan.disbursed_timestamp));
    //                 if (moment(loan.disbursed_timestamp).format('MMMM') == 'January') {
    //                           January = January + loan.amount;
    //                 }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'February') {
    //                           February = February + loan.amount;
    //                 }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'March') {
    //                          March = March + loan.amount;
    //                 }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'April') {
    //                           April = April + loan.amount;
    //                 }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'May') {
    //                           May = May + loan.amount;
    //                 }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'June') {
    //                           June = June + loan.amount;
    //                 }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'July') {
    //                           July = July + loan.amount;
    //                 }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'August') {
    //                           August = August + loan.amount;
    //                 }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'September') {
    //                           September = September + loan.amount;
    //                 }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'October') {
    //                           October = October + loan.amount;
    //                 }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'November') {
    //                           November = November + loan.amount;
    //                 }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'December') {
    //                           December = December + loan.amount;
    //                 }
    //               });
    //               // console.log("User Id = "+user._id+" User Name = "+user.name+" January_Lent = "+ January +" February_Lent = "+ February+" March_Lent = "+ March +" April_Lent = "+ April+" May_Lent = "+ May +" June_Lent = "+ June+" July_Lent = "+ July +" August_Lent = "+ August+" September_Lent = "+ September +" October_Lent = "+ October+" November_Lent = "+ November +" December_Lent = "+ December);
    //               console.log(user._id+","+user.name+","+ January +","+ February+","+ March +","+ April+","+ May +","+ June+","+ July +","+ August+","+ September +","+ October+","+ November +","+ December);
    //               // csvdata = user._id+","+user.name+","+ January +","+ February+","+ March +","+ April+","+ May +","+ June+","+ July +","+ August+","+ September +","+ October+","+ November +","+ December+"\n";
    //               // fs.appendFile('public/'+'monthly_lent.csv', csvdata,
    //               // function(err){
    //               //
    //               // });
    //             });
    //   });
// });
//

// var analysis = schedule.scheduleJob('*/3 * * * *', function(next){
//       console.log("Start analysis data");
//       fs.unlink('public/AnalyticData/lenderTotalAmount.csv', function(){
//         console.log('File deleted');
//       });
//   Users.find({'total_lent': { $gte: 0}},function(err , users){
//     users.forEach(function(user) {
//       var lentAmountAggregate  = [
//           {
//           $match: {
//             'lenderId': new mongoose.Types.ObjectId(user._id),
//             '_disbursed': true,
//           }
//         },
//         {
//           $group: {
//             _id: '',
//             total: { $sum: '$amount' }
//           }
//         },
//         {
//           $project: {
//             _id: 0,
//             total: '$total'
//           }
//         }
//       ];
//
//       var runningAmountAggregate  = [
//         {
//           $match: {
//             'lenderId': new mongoose.Types.ObjectId(user._id),
//             '_disbursed': true,
//           }
//         },
//         {
//           $unwind:'$emi'
//         },
//         {
//           $match: {
//             'emi._settled': false,
//           }
//         },
//         {
//           $group: {
//             _id: '',
//             total: { $sum: '$emi.amount' }
//           }
//         },
//         {
//           $project: {
//             _id: 0,
//             total: '$total'
//           }
//         }
//       ];
//
//       var returnsAmountAggregate  = [
//         {
//           $match: {
//             'lenderId': new mongoose.Types.ObjectId(user._id),
//             '_disbursed': true,
//           }
//         },
//         {
//           $unwind:'$emi'
//         },
//         {
//           $match: {
//             'emi._settled': true,
//           }
//         },
//         {
//           $group: {
//             _id: '',
//             total: { $sum: '$emi.amount' }
//           }
//         }
//       ];
//
//       var lastLoanDate  = [
//         {
//           $match: {
//             'lenderId': new mongoose.Types.ObjectId(user._id),
//             '_disbursed': true,
//             // '_completed': true,
//           }
//         }
//       ];
//       Loans.aggregate(lentAmountAggregate,function(err,lentAmount){
//         Loans.aggregate(runningAmountAggregate,function(err,runningAmount){
//           Loans.aggregate(returnsAmountAggregate,function(err,returnsAmount){
//             Loans.count({lenderId:user._id,_disbursed:true,_completed:false},function(err,activeLoans){
//               Loans.count({lenderId:user._id,_disbursed:true},function(err,disbursedLoans){
//                 Loans.aggregate(lastLoanDate,function(err,lentLoans){
//                   var lentAmount_ = 0;
//                   var runningAmount_ = 0;
//                   var returnsAmount_ = 0;
//                   var lastLoanDate = NaN;
//                   if (lentAmount.length) {
//                     var lentAmount_ = lentAmount[0].total;
//                   }
//                   if (runningAmount.length) {
//                     var runningAmount_ = runningAmount[0].total;
//                   }
//                   if (returnsAmount.length) {
//                     var returnsAmount_ = returnsAmount[0].total;
//                   }
//                   if (lentLoans[lentLoans.length-1]) {
//                     lastLoanDate = moment(lentLoans[lentLoans.length-1].disbursed_timestamp).format('DD/MM/YYYY');
//                   }
//                   console.log(user._id+","+user.name+","+moment(user.doj).format('MM/YYYY')+","+ lentAmount_ +","+ runningAmount_ +","+ returnsAmount_ +","+ activeLoans +","+ disbursedLoans +","+ user.city.replace(/ .*/,'') +","+ lastLoanDate);
//                   csvdata = user._id+","+user.name +","+moment(user.doj).format('MM/YYYY')+","+ lentAmount_ +","+ runningAmount_ +","+ returnsAmount_ +","+ activeLoans +","+ disbursedLoans +","+ user.city.replace(/ .*/,'') +","+ lastLoanDate+"\n";
//                   fs.appendFile('public/AnalyticData/'+'lenderTotalAmount.csv', csvdata,
//                     function(err) {
//
//                   });
//                 });
//               });
//             });
//           });
//         });
//       });
//     });
//   });
// });
// var totalWords = "foo love bar very much.";
//
// var firstWord = totalWords.replace(/ .*/,'');
//
// console.log(firstWord);


// //For fetch lenders invest amount data file for alalytic dashboard
// var analysis = schedule.scheduleJob('* */1 * * *', function(next){
//    fs.truncate('public/AnalyticData/lenderTotalAmount.csv', 0, function(){
//      console.log('done');
//    });
// Users.find({'total_lent': { $gte: 0}},function(err , users){
//   users.forEach(function(user) {
//     var lentAmountAggregate  = [{
//       $match: {
//         'lenderId': new mongoose.Types.ObjectId(user._id),
//         '_disbursed': true,
//       }
//     },{
//       $group: {
//         _id: '',
//         total: { $sum: '$amount' }
//       }
//     }, {
//       $project: {
//         _id: 0,
//         total: '$total'
//       }
//     }];
//
//     var runningAmountAggregate  = [{
//       $match: {
//         'lenderId': new mongoose.Types.ObjectId(user._id),
//         '_disbursed': true,
//       }
//     },{
//       $unwind:'$emi'
//     },{
//       $match:{'emi._settled': false,
//     }
//     },{
//     $group: {
//       _id: '',
//       total: { $sum: '$emi.amount' }
//     }
//     }, {
//     $project: {
//       _id: 0,
//       total: '$total'
//     }
//     }];
//
//     var returnsAmountAggregate  = [{
//     $match: {
//       'lenderId': new mongoose.Types.ObjectId(user._id),
//       '_disbursed': true,
//     }
//     },{
//     $unwind:'$emi'
//     },{
//     $match:{'emi._settled': true,
//     }
//     },{
//     $group: {
//     _id: '',
//     total: { $sum: '$emi.amount' }
//     }
//   }];
//     Loans.aggregate(lentAmountAggregate,function(err,lentAmount){
//       Loans.aggregate(runningAmountAggregate,function(err,runningAmount){
//         Loans.aggregate(returnsAmountAggregate,function(err,returnsAmount){
//           Loans.count({lenderId:user._id,_disbursed:true,_completed:false},function(err,activeLoans){
//             Loans.count({lenderId:user._id,_disbursed:true},function(err,disbursedLoans){
//               var lentAmount_ = 0;
//               var runningAmount_ = 0;
//               var returnsAmount_ = 0;
//               if (lentAmount.length) {
//                 var lentAmount_ = lentAmount[0].total;
//               }
//               if (runningAmount.length) {
//                 var runningAmount_ = runningAmount[0].total;
//               }
//               if (returnsAmount.length) {
//                 var returnsAmount_ = returnsAmount[0].total;
//               }
//               console.log(user._id+","+user.name+","+moment(user.doj).format('MM/YYYY')+","+ lentAmount_ +","+ runningAmount_ +","+ returnsAmount_ +","+ activeLoans +","+ disbursedLoans);
//               csvdata = user._id+","+user.name+","+moment(user.doj).format('MM/YYYY')+","+ lentAmount_ +","+ runningAmount_ +","+ returnsAmount_ +","+ activeLoans +","+ disbursedLoans+"\n";
//               fs.appendFile('public/AnalyticData/'+'lenderTotalAmount.csv', csvdata,
//               function(err){
//
//               });
//             });
//           });
//         });
//       });
//     });
//   });
// });
// });

// Users.find({'total_lent': { $gte: 0}},function(err , userss){
//   userss.forEach(function(user) {
//             // var aggregate  = [{
//             //   $match: {
//             //     'userId': new mongoose.Types.ObjectId(user._id),
//             //     '_disbursed': true,
//             //   }
//             // }];
//             // Loans.aggregate(aggregate,function(err,borrowedLoans){
//             //   if (borrowedLoans.length) {
//             //     console.log(borrowedLoans.length + "  B");
//             //   }else {
//                 var aggregate2  = [{
//                   $match: {
//                     'lenderId': new mongoose.Types.ObjectId(user._id),
//                     '_disbursed': true,
//                     // '_completed': true,
//                   }
//                 }
//               ];
//                 Loans.aggregate(aggregate2,function(err,lentLoans){
//                    var total_Disbursed = NaN;
//                   //  console.log(lentLoans[lentLoans.length-1].disbursed_timestamp);
//                   if (lentLoans.length) {
//                     console.log(lentLoans.length);
//                     lentLoans.forEach(function(loan, i){
//                       if (i == 0) {
//                         total_Disbursed = loan.disbursed_timestamp;
//                         console.log(total_Disbursed);
//                         console.log(user._id+","+user.name+","+ moment(total_Disbursed).format('MMMM'));
//
//                       }
//                     });
//                   }
//                 });
//             //   }
//             // });
//   });
// });

// Users.find({'total_lent': { $gte: 0}},function(err , userss){
//   userss.forEach(function(user) {
//     var lastLoanDate  = [{
//       $match: {
//         'lenderId': new mongoose.Types.ObjectId(user._id),
//         '_disbursed': true,
//         // '_completed': true,
//       }
//     }
//   ];
//   Loans.aggregate(lastLoanDate,function(err,lentLoans){
//     if (lentLoans[lentLoans.length-1]) {
//       console.log(user._id+","+user.name+","+ moment(lentLoans[lentLoans.length-1].disbursed_timestamp).format('MMMM'));
//     }
//   });
// });
// });

// var StringBuilder = require('stringbuilder');
//
// // create an StringBuilder();
// var sb = new StringBuilder();
//
// // you can configure all new intances of the StringBuilder
// // as default win32='\r\n' others='\n'
// // StringBuilder.configure({newline:'\r\n'});
//
// sb.append('some text') // append text
// sb.append('{0:YYYY}', new Date()) // append text formatted
// sb.appendLine('some text') // append a new line
// sb.appendLine('{0:$ 0.1}', 50.1044) // append a new line formatted
//
// console.log(sb.toString());



// var StringBuilder = require("string-builder");
// var sb = new StringBuilder();
//
// sb.append("normal text ");
//
// sb.appendLine();
//
// sb.appendFormat("formatted text {0},{1}", "format 1", "format 2");
// sb.append("normal text ");
//
// console.log(sb.toString());

              //   var aggregate  = [{
              //     $match: {
              //       'lenderId': new mongoose.Types.ObjectId("58a669a297bd79a11944d2f5"),
              //       '_disbursed': true,
              //       // '_completed': true,
              //     }
              //   }
              // ];
              //   Loans.aggregate(aggregate,function(err,lentLoans){
              //     var January = 0;
              //     var February = 0;
              //     var March = 0;
              //     var April = 0;
              //     var May = 0;
              //     var June = 0;
              //     var July = 0;
              //     var August = 0;
              //     var September = 0;
              //     var October = 0;
              //     var November =0;
              //     var December = 0;
              //
              //     lentLoans.forEach(function(loan){
              //           // console.log(moment(loan.disbursed_timestamp));
              //       if (moment(loan.disbursed_timestamp).format('MMMM') == 'January') {
              //                 January = January + loan.amount;
              //       }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'February') {
              //                 February = February + loan.amount;
              //       }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'March') {
              //                March = March + loan.amount;
              //       }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'April') {
              //                 April = April + loan.amount;
              //       }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'May') {
              //                 May = May + loan.amount;
              //       }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'June') {
              //                 June = June + loan.amount;
              //       }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'July') {
              //                 July = July + loan.amount;
              //       }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'August') {
              //                 August = August + loan.amount;
              //       }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'September') {
              //                 September = September + loan.amount;
              //       }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'October') {
              //                 October = October + loan.amount;
              //       }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'November') {
              //                 November = November + loan.amount;
              //       }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'December') {
              //                 December = December + loan.amount;
              //       }
              //     });
              //     // console.log("User Id = "+user._id+" User Name = "+user.name+" January_Lent = "+ January +" February_Lent = "+ February+" March_Lent = "+ March +" April_Lent = "+ April+" May_Lent = "+ May +" June_Lent = "+ June+" July_Lent = "+ July +" August_Lent = "+ August+" September_Lent = "+ September +" October_Lent = "+ October+" November_Lent = "+ November +" December_Lent = "+ December);
              //     console.log(January +","+ February+","+ March +","+ April+","+ May +","+ June+","+ July +","+ August+","+ September +","+ October+","+ November +","+ December);
              //     // csvdata = user._id+","+user.name+","+ January +","+ February+","+ March +","+ April+","+ May +","+ June+","+ July +","+ August+","+ September +","+ October+","+ November +","+ December+"\n";
              //     // fs.appendFile('public/'+'monthly_lent.csv', csvdata,
              //     // function(err){
              //     //
              //     // });
              //   });

// // for monthly_lent
// Users.find({'total_lent': { $gte: 0}},function(err , users){
//   users.forEach(function(user) {
//     var aggregate  = [
//       {
//         $match: {
//           'lenderId': new mongoose.Types.ObjectId(user._id),
//           '_disbursed': true,
//           // '_completed': true,
//         }
//       }
//     ];
//     var array = [];
//     Loans.aggregate(aggregate,function(err,lentLoans){
//       var presentYear = parseInt(moment().format('YYYY'));
//       var presentMonth = parseInt(moment().format('M'));
//       for (var year = 2017; year <= presentYear; year++) {
//         for (var month = 1; month <= 12; month++) {
//           var totalMomtnlyLent = 0;
//           lentLoans.forEach(function(loan){
//             if ( parseInt(moment(loan.disbursed_timestamp).format('YYYY')) == year && parseInt(moment(loan.disbursed_timestamp).format('M')) == month ) {
//               totalMomtnlyLent = totalMomtnlyLent + loan.amount;
//             }
//           });
//           array.push(totalMomtnlyLent);
//         }
//       }
//       console.log(array.join(','));
//     });
//   });
// });

// // for monthly_lent
// var analysis_monthly_lent = schedule.scheduleJob('0 */1 * * *', function(next){
//   Users.find({'total_lent': { $gte: 0}},function(err , users){
//     var presentYear = parseInt(moment().format('YYYY'));
//     var presentMonth = parseInt(moment().format('M'));
//     var monthsArray = [];
//     for (var year = 2017; year <= presentYear; year++) {
//       for (var month = 1; (year == presentYear) ? (month <= presentMonth) : (month <= 12); month++) {
//         monthsArray.push(moment().month(month-1).year(year).format('MMMM/YYYY'));
//       }
//     }
//     console.log("user._id"+","+"user.name"+","+monthsArray.join(','));
//     csvdata = "userId"+","+"userName"+","+monthsArray.join(',')+"\n";
//     fs.unlink('public/AnalyticData/monthlyLent.csv', function(){
//       console.log('File deleted');
//     });
//     fs.appendFile('public/AnalyticData/'+'monthlyLent.csv', csvdata,
//     function(err){
//
//     });
//     users.forEach(function(user) {
//       var aggregate  = [
//         {
//           $match: {
//             'lenderId': new mongoose.Types.ObjectId(user._id),
//             '_disbursed': true,
//             // '_completed': true,
//           }
//         }
//       ];
//       var array = [];
//       Loans.aggregate(aggregate,function(err,lentLoans){
//         for (var year = 2017; year <= presentYear; year++) {
//           for (var month = 1; (year == presentYear) ? (month <= presentMonth) : (month <= 12); month++) {
//             var totalMomtnlyLent = 0;
//             lentLoans.forEach(function(loan){
//               if ( parseInt(moment(loan.disbursed_timestamp).format('YYYY')) == year && parseInt(moment(loan.disbursed_timestamp).format('M')) == month ) {
//                 if (loan.disbursed_timestamp == null) {
//                   // console.log(loan.disbursed_timestamp);
//                 } else {
//                   totalMomtnlyLent = totalMomtnlyLent + loan.amount;
//                 }
//               }
//             });
//             array.push(totalMomtnlyLent);
//           }
//         }
//         console.log(user._id+","+user.name+","+array.join(','));
//         csvdata = user._id+","+user.name+","+array.join(',')+"\n";
//         fs.appendFile('public/AnalyticData/'+'monthlyLent.csv', csvdata,
//         function(err){
//
//         });
//       });
//     });
//   });
// });



// // for monthly_lent
// Users.find({'total_lent': { $gte: 0}},function(err , users){
//
//   var presentYear = parseInt(moment().format('YYYY'));
//   var presentMonth = parseInt(moment().format('M'));
//   var monthsArray = [];
//   for (var year = 2017; year <= presentYear; year++) {
//     for (var month = 1; (year == presentYear) ? (month <= presentMonth) : (month <= 12); month++) {
//       monthsArray.push(moment().month(month-1).year(year).format('MMMM/YYYY'));
//     }
//   }
//   console.log("user._id"+","+"user.name"+","+monthsArray.join(','));
//   csvdata = "userId"+","+"userName"+","+monthsArray.join(',')+"\n";
//   // fs.unlink('public/AnalyticData/monthlyLent.csv', function(){
//   //   console.log('File deleted');
//   // });
//   // fs.appendFile('public/AnalyticData/'+'monthlyLent.csv', csvdata,
//   // function(err){
//   //
//   // });
//   users.forEach(function(user) {
//     var aggregate  = [
//       {
//         $match: {
//           'lenderId': new mongoose.Types.ObjectId(user._id),
//           '_disbursed': true,
//           // '_completed': true,
//         }
//       }
//     ];
//     var array = [];
//     Loans.aggregate(aggregate,function(err,lentLoans){
//       for (var year = 2017; year <= presentYear; year++) {
//         // for (var month = 1; month <= 12; month++) {
//         for (var month = 1; (year == presentYear) ? (month <= presentMonth) : (month <= 12); month++) {
//           var totalMomtnlyLent = 0;
//           lentLoans.forEach(function(loan){
//             if ( parseInt(moment(loan.disbursed_timestamp).format('YYYY')) == year && parseInt(moment(loan.disbursed_timestamp).format('M')) == month ) {
//               if (loan.disbursed_timestamp == null) {
//                 // console.log(loan.disbursed_timestamp);
//               } else {
//                 totalMomtnlyLent = totalMomtnlyLent + loan.amount;
//               }
//             }
//           });
//           array.push(totalMomtnlyLent);
//         }
//       }
//       console.log(user._id+","+user.name+","+array.join(','));
//       csvdata = user._id+","+user.name+","+array.join(',')+"\n";
//       // fs.appendFile('public/AnalyticData/'+'monthlyLent.csv', csvdata,
//       // function(err){
//       //
//       // });
//     });
//   });
// });

// var presentYear = parseInt(moment().format('YYYY'));
// var presentMonth = parseInt(moment().format('M'));
// var monthsArray = [];
// for (var year = 2017; year <= presentYear; year++) {
//   for (var month = 1; (year == presentYear) ? (month <= presentMonth) : (month <= 12); month++) {
//      monthsArray.push(moment().month(month-1).year(year).format('MMMM/YYYY'));
//   }
// }
// console.log(monthsArray.join(','));

//   var aggregate  = [{
//     $match: {
//       'lenderId': new mongoose.Types.ObjectId("58a669a297bd79a11944d2f5"),
//       '_disbursed': true,
//       // '_completed': true,
//     }
//   }
// ];
//   Loans.aggregate(aggregate,function(err,lentLoans){
//     var January = 0;
//     var February = 0;
//     var March = 0;
//     var April = 0;
//     var May = 0;
//     var June = 0;
//     var July = 0;
//     var August = 0;
//     var September = 0;
//     var October = 0;
//     var November =0;
//     var December = 0;
//
//     lentLoans.forEach(function(loan){
//           // console.log(moment(loan.disbursed_timestamp));
//       if (moment(loan.disbursed_timestamp).format('MMMM') == 'January') {
//                 January = January + loan.amount;
//       }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'February') {
//                 February = February + loan.amount;
//       }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'March') {
//                March = March + loan.amount;
//       }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'April') {
//                 April = April + loan.amount;
//       }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'May') {
//                 May = May + loan.amount;
//       }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'June') {
//                 June = June + loan.amount;
//       }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'July') {
//                 July = July + loan.amount;
//       }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'August') {
//                 August = August + loan.amount;
//       }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'September') {
//                 September = September + loan.amount;
//       }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'October') {
//                 October = October + loan.amount;
//       }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'November') {
//                 November = November + loan.amount;
//       }else if (moment(loan.disbursed_timestamp).format('MMMM') == 'December') {
//                 December = December + loan.amount;
//       }
//     });
//     console.log(January +","+ February+","+ March +","+ April+","+ May +","+ June+","+ July +","+ August+","+ September +","+ October+","+ November +","+ December);
//   });


// console.log(moment("2017-01-03T13:52:48.607Z").format('MMMM'));
// console.log(moment("2017-02-03T13:52:48.607Z").format('MMMM'));
// console.log(moment("2017-03-03T13:52:48.607Z").format('MMMM'));
// console.log(moment("2017-04-03T13:52:48.607Z").format('MMMM'));
// console.log(moment("2017-05-03T13:52:48.607Z").format('MMMM'));
// console.log(moment("2017-06-03T13:52:48.607Z").format('MMMM'));
// console.log(moment("2017-07-03T13:52:48.607Z").format('MMMM'));
// console.log(moment("2017-08-03T13:52:48.607Z").format('MMMM'));
// console.log(moment("2017-09-03T13:52:48.607Z").format('MMMM'));
// console.log(moment("2017-10-03T13:52:48.607Z").format('MMMM'));
// console.log(moment("2017-11-03T13:52:48.607Z").format('MMMM'));
// console.log(moment("2017-12-03T13:52:48.607Z").format('MMMM'));

// Users.find({'_lender': true },function(err , users){
// console.log(users.length);
// users.forEach(function(user){
//     Loans.find('selector')
// });
// });

    // Users.find({'_lender':true},function(err , userss){
    //   console.log(userss.length);
    //   userss.forEach(function(user) {
    //             var aggregate  = [{
    //               $match: {
    //                 'userId': new mongoose.Types.ObjectId(user._id),
    //                 '_disbursed': true,
    //                 // '_completed': true,
    //               }
    //             }];
    //             Loans.aggregate(aggregate,function(err,borrowedLoans){
    //               // console.log("User Id = "+user._id+" User Name = "+user.name+" completed loans = "+borrowedLoans.length);
    //               if (borrowedLoans.length) {
    //                 // console.log(borrowedLoans.length);
    //               }else {
    //                  console.log(user._id+","+user.name+","+user.city);
    //                 csvdata = user._id+","+user.name+","+user.city+"\n";
    //                 fs.appendFile('public/'+'Original_lenders.csv', csvdata,
    //                 function(err){
    //
    //                 });
    //               }
    //             });
    //   });
    // });


//     Users.find({'_lender':true},function(err , userss){
//       // console.log(userss.length);
//       userss.forEach(function(user) {
//                 var aggregate  = [{
//                   $match: {
//                     'userId': new mongoose.Types.ObjectId(user._id),
//                     '_disbursed': true,
//                     // '_completed': true,
//                   }
//                 }];
//                 Loans.aggregate(aggregate,function(err,borrowedLoans){
//                   // console.log("User Id = "+user._id+" User Name = "+user.name+" completed loans = "+borrowedLoans.length);
//                   if (borrowedLoans.length) {
//                     // console.log(borrowedLoans.length);
//                   }else {
//     var aggregate1  = [{
//       $match: {
//         // 'lenderId': new mongoose.Types.ObjectId(value._id),
//         'lenderId': new mongoose.Types.ObjectId(user._id),
//         '_disbursed': true,
//       }
//     },{
//       $unwind:'$emi'
//     }, {
//       $match: {
//         'emi._settled': true,
//         'emi._disbursed': true,
//       }
//     }];
//     Loans.aggregate(aggregate1,function(err,emis){
//         var Total_Invested = 0;
//         var Total_Returns = 0;
//        emis.forEach(function(emi) {
//             Total_Invested = Total_Invested+emi.amount/emi.emi_count;
//             Total_Returns = Total_Returns+emi.lender_total/emi.emi_count;
//        });
//        console.log(idd);
//        console.log("Total_Invested             "+Total_Invested);
//        console.log("Total_Returns              "+Total_Returns);
//        console.log("-----------X-----------");
//     });
// // asdfghjkl
//     var aggregate2  = [{
//       $match: {
//         // 'lenderId': new mongoose.Types.ObjectId(value._id),
//         'lenderId': new mongoose.Types.ObjectId(user._id),
//         '_disbursed': true,
//       }
//     },{
//       $unwind:'$emi'
//     }, {
//       $match: {
//         'emi._settled': false,
//       }
//     }];
//     Loans.aggregate(aggregate2,function(err,emis){
//         var Total_Invested = 0;
//         // var Total_Returns = 0;
//        emis.forEach(function(emi) {
//             Total_Invested = Total_Invested+emi.amount/emi.emi_count;
//             // Total_Returns = Total_Returns+emi.lender_total/emi.emi_count;
//        });
//        console.log("Total_Invested_running        "+Total_Invested);
//       //  console.log(Total_Returns);
//        console.log("-----------X-----------");
//     });
//
//               }
//             });
//   });
// });


// Users.find({'_lender':true},function(err , userss){
//   console.log(userss.length);
//   userss.forEach(function(user) {
//             var aggregate  = [{
//               $match: {
//                 'userId': new mongoose.Types.ObjectId(user._id),
//                 '_disbursed': true,
//                 // '_completed': true,
//               }
//             }];
//             Loans.aggregate(aggregate,function(err,borrowedLoans){
//               if (borrowedLoans.length) {
//                 // console.log(borrowedLoans.length);
//               }else {
//                 //  console.log(user._id+","+user.name+","+user.city);
//                 // csvdata = user._id+","+user.name+","+user.city+"\n";
//                 // fs.appendFile('public/'+'Original_lenders.csv', csvdata,
//                 // function(err){
//                 //
//                 // });
//
//                 var aggregate2  = [{
//                   $match: {
//                     'lenderId': new mongoose.Types.ObjectId(user._id),
//                     '_disbursed': true,
//                     // '_completed': true,
//                   }
//                 }
//               ];
//                 Loans.aggregate(aggregate2,function(err,lentLoans){
//                    var total_Disbursed = 0;
//                    console.log(lentLoans.length);
//                    console.log(lentLoans[lentLoans.length-1].disbursed_timestamp);
//
//                   // lentLoans.forEach(function(loan){
//                   //
//                   // total_Disbursed = total_Disbursed + loan.amount;
//                   // });
//                   // // console.log("User Id = "+user._id+" User Name = "+user.name+" January_Lent = "+ January +" February_Lent = "+ February+" March_Lent = "+ March +" April_Lent = "+ April+" May_Lent = "+ May +" June_Lent = "+ June+" July_Lent = "+ July +" August_Lent = "+ August+" September_Lent = "+ September +" October_Lent = "+ October+" November_Lent = "+ November +" December_Lent = "+ December);
//                   // console.log(user._id+","+user.name+","+user.city+","+ total_Disbursed);
//                   // csvdata = user._id+","+user.name+","+user.city+","+ total_Disbursed+"\n";
//                   // fs.appendFile('public/'+'total_lent.csv', csvdata,
//                   // function(err){
//                   //
//                   // });
//                 });
//
//
//               }
//             });
//   });
// });

// Users.find({'total_lent': { $gte: 0}},function(err , users){
//   console.log(users.length);
//   users.forEach(function(user) {
//
//             var aggregate  = [{
//               $match: {
//                 'lenderId': new mongoose.Types.ObjectId(user._id),
//                 '_disbursed': true,
//                 // '_completed': true,
//               }
//             }
//           ];
//             Loans.aggregate(aggregate,function(err,lentLoans){
//                var total_Disbursed = 0;
//
//               lentLoans.forEach(function(loan){
//
//               total_Disbursed = total_Disbursed + loan.amount;
//               });
//               // console.log("User Id = "+user._id+" User Name = "+user.name+" January_Lent = "+ January +" February_Lent = "+ February+" March_Lent = "+ March +" April_Lent = "+ April+" May_Lent = "+ May +" June_Lent = "+ June+" July_Lent = "+ July +" August_Lent = "+ August+" September_Lent = "+ September +" October_Lent = "+ October+" November_Lent = "+ November +" December_Lent = "+ December);
//               console.log(user._id+","+user.name+","+ total_Disbursed);
//               // csvdata = user._id+","+user.name+","+ January +","+ February+","+ March +","+ April+","+ May +","+ June+","+ July +","+ August+","+ September +","+ October+","+ November +","+ December+"\n";
//               // fs.appendFile('public/'+'monthly_lent.csv', csvdata,
//               // function(err){
//               //
//               // });
//             });
//   });
// });


// Users.find({'_lender':true},function(err , userss){
//   console.log(userss.length);
//   userss.forEach(function(user) {
//             var aggregate  = [{
//               $match: {
//                 'userId': new mongoose.Types.ObjectId(user._id),
//                 '_disbursed': true,
//                 // '_completed': true,
//               }
//             }];
//             Loans.aggregate(aggregate,function(err,borrowedLoans){
//               if (borrowedLoans.length) {
//                 // console.log(borrowedLoans.length);
//               }else {
//                 var aggregate2  = [{
//                   $match: {
//                     'lenderId': new mongoose.Types.ObjectId(user._id),
//                     '_disbursed': true,
//                     // '_completed': true,
//                   }
//                 }
//               ];
//                 Loans.aggregate(aggregate2,function(err,lentLoans){
//                    var total_Disbursed = NaN;
//                   //  console.log(lentLoans[lentLoans.length-1].disbursed_timestamp);
//                   if (lentLoans.length) {
//                     console.log(lentLoans.length);
//                     lentLoans.forEach(function(loan, i){
//                       if (i==0) {
//                         total_Disbursed = loan.disbursed_timestamp;
//                         console.log(total_Disbursed);
//                         console.log(user._id+","+user.name+","+ moment(total_Disbursed).format('MMMM'));
//                         csvdata = user._id+","+user.name+","+ moment(total_Disbursed).format('MMMM')+"\n";
//                         fs.appendFile('public/'+'firstLoanDate.csv', csvdata,
//                         function(err){
//
//                         });
//                       }
//                     });
//                   }
//                   // console.log(user._id+","+user.name+","+ moment(total_Disbursed).format('MMMM'));
//                   // csvdata = user._id+","+user.name+","+ moment(total_Disbursed).format('MMMM')+"\n";
//                   // fs.appendFile('public/'+'lastLoanDate.csv', csvdata,
//                   // function(err){
//                   //
//                   // });
//                 });
//
//
//               }
//             });
//   });
// });

// Users.find({},function(err,users){
//      console.log(users.length);
//      users.forEach(function(user){
//                          console.log(user._id+","+user.name+","+ user.category);
//                          csvdata = user._id+","+user.name+","+ user.category+"\n";
//                          fs.appendFile('public/'+'usersCategory.csv', csvdata,
//                          function(err){
//
//                          });
//      });
//      console.log("---X---");
// });
//
// Users.find({'_lender':true},function(err , userss){
//   console.log(userss.length);
//   userss.forEach(function(user) {
//             var aggregate  = [{
//               $match: {
//                 'userId': new mongoose.Types.ObjectId(user._id),
//                 '_disbursed': true,
//                 // '_completed': true,
//               }
//             }];
//             Loans.aggregate(aggregate,function(err,borrowedLoans){
//               if (borrowedLoans.length) {
//                 // console.log(borrowedLoans.length);
//               }else {
//                 var aggregate2  = [{
//                   $match: {
//                     'lenderId': new mongoose.Types.ObjectId(user._id),
//                     '_disbursed': true,
//                     // '_completed': true,
//                   }
//                 }
//               ];
//                 Loans.aggregate(aggregate2,function(err,lentLoans){
//                   if (lentLoans.length) {
//                     console.log(lentLoans.length);
//                     lentLoans.forEach(function(loan){
//                       console.log(loan);
//                       // if (i==0) {
//                       //   total_Disbursed = loan.disbursed_timestamp;
//                       //   console.log(total_Disbursed);
//                       //   console.log(user._id+","+user.name+","+ moment(total_Disbursed).format('MMMM'));
//                       //   csvdata = user._id+","+user.name+","+ moment(total_Disbursed).format('MMMM')+"\n";
//                       //   fs.appendFile('public/'+'firstLoanDate.csv', csvdata,
//                       //   function(err){
//                       //
//                       //   });
//                       // }
//                     });
//                   }
//                 });
//               }
//             });
//   });
// });

// Loans.find({},function(err,loans){
//  console.log(loans.length);
//  loans.forEach(function(laon){
//
//  });
// });

// console.log("Start Reminders/Alert SmS");
//   var aggregate  = [{
//     $match: {
//       '_disbursed': true,
//       '_completed': false
//     }
//   }];
//   Loans.aggregate(aggregate,function(err,loans){
//     Loans.populate(loans, [{ path: 'userId', select: 'name' }],function(err,loans){
//         console.log(loans.length);
//         loans.forEach(function(loan){
//           // console.log(loan);
//           console.log(loan.userId._id+","+moment(loan.disbursed_timestamp).format('MMMM'));
//                                   csvdata = loan.userId._id+","+moment(loan.disbursed_timestamp).format('MMMM')+"\n";
//                                   fs.appendFile('public/'+'DefaultLoanMonth.csv', csvdata,
//                                   function(err){
//
//                                   });
//         });
//         console.log("---X---");
//   });
//   });


  // var aggregate  = [{
  //   $match: {
  //     '_disbursed': true
  //   }
  // },{
  //   $unwind:'$emi'
  // }, {
  //   $match: {
  //     'emi._settled': false
  //   }
  // }];
  // Loans.aggregate(aggregate,function(err,emis){
  //   Loans.populate(emis, [{ path: 'userId'},{ path: 'lenderId', select: 'name' }],function(err,emis){
  //     emis.forEach(function(value) {
  //       var month;
  //       if ( parseInt(moment().format('D')) > 4 ) {
  //         month = moment().add(1, 'M').format("MMMM");
  //       } else {
  //         month = moment().format('MMMM');
  //       }
  //       // console.log(value.amount);
  //       // console.log(value.total);
  //       // console.log(value.userId.email);
  //       // console.log(value.userId.name);
  //       // console.log(value.emi.due_date);
  //       // // console.log(moment(value.emi.due_date).format('LL'));
  //       // // console.log(moment().format('MMMM Do YYYY, h:mm:ss a'));
  //       // console.log(moment().tz('Asia/Calcutta').format('MMMM Do YYYY, h:mm:ss a'));
  //       // console.log(moment().tz('Asia/Calcutta').diff(value.emi.due_date, 'days'));
  //       if (0 < moment().diff(value.emi.due_date, 'days')) {
  //         var data = {
  //           from: 'Z2P Support<contact@z2p.today>', //replace with your SMTP Login ID
  //           to: value.userId.email, // enter email Id to which email notification has to come.
  //           subject: "Z2P - Month End Loan Repayment (bit.ly/z2prepayment)", //Subject Line
  //           html: "Hi "+ value.userId.name +",<br><br>This is to inform that the month is about to end and the salary date is almost here. If your repayment is due post the <b>4th of " + month +",</b> we will carry out extensive recovery and legal actions and no further extension will be given.<br><br>Kindly ignore if you have already repaid or taken an extension.<br><br><b>Repayment Amount:</b> Rs" + value.emi.amount + "<br><address><b>Bank details to transfer:</b><br>Mode of Payment: IMPS<br>Bank Name: ICICI Bank<br>Account Type: Current<br>Account Name: Shujat Technologies Private Limited<br>Account number: 004005016952<br>IFSC Code: ICIC0000040<br>Branch: ISB CAMPUS, GACHIBOWLI, HYDERABAD<br><b>Kindly update the payment at the following link when done:<big>http://bit.ly/z2prepayment<big></b><br><br><b>Regards,<br>Team Z2P</b></address>"
  //         };
  //         //  send mail
  //         mailgun.messages().send(data, function (error, body) {
  //           console.log(body);
  //           if(!error)
  //           console.log("Mail Sent!");
  //           else
  //           console.log("Mail not sent <br/>Error Message : "+error);
  //         });
  //         sleep(40000);
  //       }
  //     });
  //   });
  // });

  // console.log("Start");
  //   // var aggregate  = [{
  //   //   $match: {
  //   //     'vpa': '8412828177@kotak',
  //   //   }
  //   // },{
  //   //   $group : {
  //   //     _id:null,
  //   //     count: { $sum:1}
  //   //   }
  //   // }];
  //   var aggregate  = [{
  //         $match:{
  //           _disbursed: true
  //         }
  //       }, {
  //       $group: {
  //           _id: '',
  //           total: { $sum: '$amount' }
  //       }
  //   }, {
  //       $project: {
  //           _id: 0,
  //           total: '$total'
  //       }
  //   }];
  //   Loans.aggregate(aggregate,function(err,users){
  //       console.log(users);
  //   });

// var css = require('commonsubstrings');
// console.log("Start");
// Users.find({'_contacts':true,'_messages':true},function(err,users){
//   var phone = '9652048776';
//    console.log("---X---");
//     // var path_csv = '/media/ankit/Study/files&data'+'/'+user._id+'.txt';
//     // var path_sms = '/media/ankit/Study/files&data/sms.txt';
//     var path_contact1 = '/media/ankit/Study/files&data/c1.csv';
//     var path_contact2 = '/media/ankit/Study/files&data/c2.csv';
//     // var sms = fs.readFileSync(path_sms, 'utf8');
//     var contact = fs.readFileSync(path_contact1, 'utf8');
//     var contact1 = fs.readFileSync(path_contact2, 'utf8');
//     myString = contact.replace(/[^\d,]+/g, '');
//     myString111 = myString.replace(/\W+/g, ' ');
//     // console.log(myString);
//     // console.log(myString111);
//     myString1 = contact1.replace(/[^\d,]+/g, '');
//     myString1111 = myString1.replace(/\W+/g, ' ');
//     // console.log(myString1111);
//     // console.log(myString);
//     // console.log((contact.replace(/\s/g, '')));   //Match mobile number with all list
//     // console.log((contact.replace(/\s/g, '').match(new RegExp(phone, "g")) || []).length);   //Match mobile number with all list
//     console.log(css(myString111, myString1111));
//     console.log("---X---");
//
// });

// Users.findOne({'_id':'58a7d0c497bd79a11944d2fe'},function(err,user){
//   if (user.user_limit == null) {
//      console.log("set");
//   }
// });

//
// Loans.find({'userId':'590b75975b64cc1b03436a13'},function(err,user){
//   console.log(user);
//
// });

// Users.findOne({'phone' : 8109522305}).select('phone name email city comment vpa user_limit').exec(function(err, user) {
//     Loans.find({'userId' : user._id},{emi:0}).populate({ path: 'lenderId', select: 'name' }).exec(function(err, borrowedLoans){
//       if (err == null) {
//         console.log(user);
//         console.log(borrowedLoans[borrowedLoans.length-1]);
//       } else {
//         console.log('Milestone Error: ',err);
//       }
//     });
// });

// //Fetch Details for freshchat
// module.exports.fetchFreshchatDetails = function(req, res, next) {
// 	users.findOne({'phone': req.user.phone}).select('phone name email comment vpa').exec(function(err, user) {
// 	    loans.find({ 'userId':req.user._id},{emi:0}).populate({ path: 'lenderId', select: 'name' }).exec(function(err, borrowedLoans){
// 	      if (err == null) {
// 	        res.json({success:true,user:user,loan:borrowedLoans[borrowedLoans.length-1]});
// 	      } else {
// 	        console.log('Milestone Error: ',err);
// 	        res.json({success:false,error:"Internal Server Error. Please try again."});
// 	      }
// 	    });
// 	});
// };

// Users.findOne({'_id':'590b75975b64cc1b03436a13'}).select('phone name email comment vpa').exec(function(err, user) {
//   Loans.find({userId:'590b75975b64cc1b03436a13'},function(err,borrowedLoans){
//     Loans.findOne({_id:borrowedLoans[borrowedLoans.length-1]._id},{emi:0}).populate({ path: 'lenderId', select: 'name' }).exec(function(err, loan){
//       if (err == null) {
//         console.log(user);
//         console.log(loan);
//       } else {
//         console.log('Milestone Error: ',err);
//       }
//     });
//   });
// });

// Users.findOne({'_id':'590b75975b64cc1b03436a13'},function(err,user){
//   Loans.find({userId:'590b75975b64cc1b03436a13'},function(err,borrowedLoans){
//     console.log(borrowedLoans[borrowedLoans.length-1]._id);
//     var loanId = borrowedLoans[borrowedLoans.length-1]._id;
//     Loans.findOne({_id:loanId}).select('amount emi_count userId lenderId').populate({ path: 'lenderId', select: 'name' }).exec(function(err, loan){
//       console.log(loan);
//     });
//   });
// });


// var data = {
// from: 'Z2P Support<contact@z2p.today>', //replace with your SMTP Login ID
// to: 'almas@zup.today', // enter email Id to which email notification has to come.
// subject: "Z2P - Loan Request", //Subject Line
// html: "Hi "+ "req.body.name" +",<br><p>We are excited to getting you on-board as an investor in Z2P! Thank you for choosing us.<br><br>Please find attached PDF document and go through it in order to familiarize yourself with the process of investing via Z2P.<br><br>Hoping to hear back from you soon!<br><br><address><b>Regards,<br>Team Z2P</b></address>",
// attachment: 'Z2P-Invest.pdf'
// // attachment: '/home/ubuntu/z2p/public/uploads/Z2P-Invest.pdf'
// };
// //  send mail
// mailgun.messages().send(data, function (error, body) {
// console.log(body);
// if(!error)
// console.log("Registration Mail Sent!");
// else
// console.log("Registration Mail not sent <br/>Error Message : "+error);
// });

// var data = {
// from: 'Z2P Support<contact@z2p.today>', //replace with your SMTP Login ID
// to: 'sujeetgupta@zup.today', // enter email Id to which email notification has to come.
// subject: "Z2P - Loan Request", //Subject Line
// html: "Hi "+ "req.body.name" +",<br><br>Welcome to Z2P, the fastest loan disbursement platform in India. We are currently undergoing a major maintenance and overhaul work which will take 7-14 days. We request you to please update your profile by the time and as soon as we are back, we will approve your loan and and notify via email.<br><br>Really sorry for the short-term inconvenience.<br><br><address><b>Regards,<br>Team Z2P</b></address>",
// };
// //  send mail
// mailgun.messages().send(data, function (error, body) {
// console.log(body);
// if(!error)
// console.log("Registration Mail Sent!");
// else
// console.log("Registration Mail not sent <br/>Error Message : "+error);
// });

// var css = require('commonsubstrings');
// console.log("Start");
// Users.find({'_contacts':true,'_messages':true},function(err,users){
//   var phone = '9652048776';
//    console.log("---X---");
//     // var path_csv = '/media/ankit/Study/files&data'+'/'+user._id+'.txt';
//     // var path_sms = '/media/ankit/Study/files&data/sms.txt';
//     var path_contact1 = '/media/ankit/Study/files&data/c11.csv';
//     var path_contact2 = '/media/ankit/Study/files&data/c22.csv';
//     // var sms = fs.readFileSync(path_sms, 'utf8');
//     var contact = fs.readFileSync(path_contact1, 'utf8');
//     var contact1 = fs.readFileSync(path_contact2, 'utf8');
//     myString = contact.replace(/[^\d,]+/g, '');
//     myString111 = myString.replace(/\W+/g, ' ');
//     // console.log(myString);
//     // console.log(myString111);
//     myString1 = contact1.replace(/[^\d,]+/g, '');
//     myString1111 = myString1.replace(/\W+/g, ' ');
//     // console.log(myString1111);
//     // console.log(myString);
//     // console.log((contact.replace(/\s/g, '')));   //Match mobile number with all list
//     // console.log((contact.replace(/\s/g, '').match(new RegExp(phone, "g")) || []).length);   //Match mobile number with all list
//     console.log(css(myString111, myString1111));
//     console.log("---X---");
//
// });

// //For fetch lenders invest amount data file for alalytic dashboard
// var analysis_total_lent = schedule.scheduleJob('0 */1 * * *', function(next){
//       console.log("Start analysis data");
//       fs.unlink('public/AnalyticData/lenderTotalAmount.csv', function(){
//         console.log('File deleted');
//       });
//   Users.find({'total_lent': { $gte: 0}},function(err , users){
//     users.forEach(function(user) {
//       var lentAmountAggregate  = [
//           {
//           $match: {
//             'lenderId': new mongoose.Types.ObjectId(user._id),
//             '_disbursed': true,
//           }
//         },
//         {
//           $group: {
//             _id: '',
//             total: { $sum: '$amount' }
//           }
//         },
//         {
//           $project: {
//             _id: 0,
//             total: '$total'
//           }
//         }
//       ];
//
//       var runningAmountAggregate  = [
//         {
//           $match: {
//             'lenderId': new mongoose.Types.ObjectId(user._id),
//             '_disbursed': true,
//           }
//         },
//         {
//           $unwind:'$emi'
//         },
//         {
//           $match: {
//             'emi._settled': false,
//           }
//         },
//         {
//           $group: {
//             _id: '',
//             total: { $sum: '$emi.amount' }
//           }
//         },
//         {
//           $project: {
//             _id: 0,
//             total: '$total'
//           }
//         }
//       ];
//
//       var returnsAmountAggregate  = [
//         {
//           $match: {
//             'lenderId': new mongoose.Types.ObjectId(user._id),
//             '_disbursed': true,
//           }
//         },
//         {
//           $unwind:'$emi'
//         },
//         {
//           $match: {
//             'emi._settled': true,
//           }
//         },
//         {
//           $group: {
//             _id: '',
//             total: { $sum: '$emi.amount' }
//           }
//         }
//       ];
//
//       var lastLoanDate  = [
//         {
//           $match: {
//             'lenderId': new mongoose.Types.ObjectId(user._id),
//             '_disbursed': true,
//             // '_completed': true,
//           }
//         }
//       ];
//       Loans.aggregate(lentAmountAggregate,function(err,lentAmount){
//         Loans.aggregate(runningAmountAggregate,function(err,runningAmount){
//           Loans.aggregate(returnsAmountAggregate,function(err,returnsAmount){
//             Loans.count({lenderId:user._id,_disbursed:true,_completed:false},function(err,activeLoans){
//               Loans.count({lenderId:user._id,_disbursed:true},function(err,disbursedLoans){
//                 Loans.aggregate(lastLoanDate,function(err,lentLoans){
//                   var lentAmount_ = 0;
//                   var runningAmount_ = 0;
//                   var returnsAmount_ = 0;
//                   var lastLoanDate = NaN;
//                   var firstLoanDate = NaN;
//                   if (lentAmount.length) {
//                     var lentAmount_ = lentAmount[0].total;
//                   }
//                   if (runningAmount.length) {
//                     var runningAmount_ = runningAmount[0].total;
//                   }
//                   if (returnsAmount.length) {
//                     var returnsAmount_ = returnsAmount[0].total;
//                   }
//                   if (lentLoans[lentLoans.length-1]) {
//                     lastLoanDate = moment(lentLoans[lentLoans.length-1].disbursed_timestamp).format('DD/MM/YYYY');
//                   }
//                   if (lentLoans[0]) {
//                     firstLoanDate = moment(lentLoans[0].disbursed_timestamp).format('DD/MM/YYYY');
//                   }
//                   console.log(user._id+","+user.name+","+moment(user.doj).format('MM/YYYY')+","+ lentAmount_ +","+ runningAmount_ +","+ returnsAmount_ +","+ activeLoans +","+ disbursedLoans +","+ user.city.replace(/ .*/,'') +","+ lastLoanDate +","+ firstLoanDate);
//                   csvdata = user._id+","+user.name +","+moment(user.doj).format('MM/YYYY')+","+ lentAmount_ +","+ runningAmount_ +","+ returnsAmount_ +","+ activeLoans +","+ disbursedLoans +","+ user.city.replace(/ .*/,'') +","+ lastLoanDate +","+ firstLoanDate+"\n";
//                   fs.appendFile('public/AnalyticData/'+'lenderTotalAmount.csv', csvdata,
//                     function(err) {
//
//                   });
//                 });
//               });
//             });
//           });
//         });
//       });
//     });
//   });
// });

// // for monthly_lent data file for alalytic dashboard
// // var analysis_monthly_lent = schedule.scheduleJob('*/3 * * * *', function(next){
//   Users.find({'total_lent': { $gte: 0}},function(err , users){
//     var presentYear = parseInt(moment().format('YYYY'));
//     var presentMonth = parseInt(moment().format('M'));
//     var monthsArray = [];
//     for (var year = 2017; year <= presentYear; year++) {
//       for (var month = 1; (year == presentYear) ? (month <= presentMonth) : (month <= 12); month++) {
//         monthsArray.push(moment().month(month-1).year(year).format('MM/YYYY'));
//       }
//     }
//     console.log("user._id"+","+"user.name"+","+monthsArray.join(','));
//     csvdata = ""+","+""+","+monthsArray.join(',')+"\n";
//     fs.unlink('public/AnalyticData/monthlyLent.csv', function(){
//       console.log('File deleted');
//     });
//     fs.appendFile('public/AnalyticData/'+'monthlyLent.csv', csvdata,
//     function(err){
//
//     });
//     users.forEach(function(user) {
//       var aggregate  = [
//         {
//           $match: {
//             'lenderId': new mongoose.Types.ObjectId(user._id),
//             '_disbursed': true,
//             // '_completed': true,
//           }
//         }
//       ];
//       var array = [];
//       Loans.aggregate(aggregate,function(err,lentLoans){
//         for (var year = 2017; year <= presentYear; year++) {
//           for (var month = 1; (year == presentYear) ? (month <= presentMonth) : (month <= 12); month++) {
//             var totalMomtnlyLent = 0;
//             lentLoans.forEach(function(loan){
//               if ( parseInt(moment(loan.disbursed_timestamp).format('YYYY')) == year && parseInt(moment(loan.disbursed_timestamp).format('M')) == month ) {
//                 if (loan.disbursed_timestamp == null) {
//                   // console.log(loan.disbursed_timestamp);
//                 } else {
//                   totalMomtnlyLent = totalMomtnlyLent + loan.amount;
//                 }
//               }
//             });
//             array.push(totalMomtnlyLent);
//           }
//         }
//         console.log(user._id+","+user.name+","+array.join(','));
//         csvdata = user._id+","+user.name+","+array.join(',')+"\n";
//         fs.appendFile('public/AnalyticData/'+'monthlyLent.csv', csvdata,
//         function(err){
//
//         });
//       });
//     });
//   });
// // });

// // for borrowersDetail data file for alalytic dashboard
// var analysis_borrowers_detail = schedule.scheduleJob('*/50 * * * *', function(next){
//   Users.find({'_paid':true},function(err , borrowers){
//     // ================================File delete================================
//     fs.unlink('public/AnalyticData/borrowersDetail.csv', function(){
//       console.log('File deleted');
//     });
//     // ===========================================================================
//     borrowers.forEach(function(user) {
//       // ========================================aggregate========================================
//       // aggregate variable for find all loans which disbursed for perticular userId
//       var aggregate  = [{
//         $match: {
//           'userId': new mongoose.Types.ObjectId(user._id),
//           '_disbursed': true,
//         }
//       }];
//       // =========================================================================================
//
//       // ========================================borrowedAmountAggregate========================================
//       // aggregate variable for find all loans which disbursed for perticular userId
//       var borrowedAmountAggregate  = [{
//         $match: {
//           'userId': new mongoose.Types.ObjectId(user._id),
//           '_disbursed': true,
//         }
//       },
//       {
//         $group: {
//           _id: '',
//           total: { $sum: '$amount' }
//         }
//       }];
//       // ========================================================================================================
//
  //     // ========================================emiAggregate========================================
  //     // aggregate variable for find all emi as a different document which disbursed for perticular userId
  //     // var emiAggregate  = [{
  //     //   $match: {
  //     //     'userId': new mongoose.Types.ObjectId(user._id),
  //     //     '_disbursed': true,
  //     //   }
  //     // },
  //     // {
  //     //   $unwind:'$emi'
  //     // }];
  //
  //     var aggregate = [{
  //   $match:{
  //       _disbursed:true,
  //   }
  // },{
  // 	$lookup:{
  // 		from: "users",
  //       localField: "lenderId",
  //       foreignField: "_id",
  //       as: "lender"
  // 	}
  // },{
  //   $unwind:'$emi'
  // }, {
  //   $match: {
  //   	'emi._settled': true,
  //       'emi._disbursed': {$ne:true},
  //   }
  // }, {
  //   $project:{
  //     _id:0,
  //     settlementId:'$emi._id',
  //     // amount:{$floor:{$divide:['$lender_total','$emi_count']}},
  //     amount:{ $add: [ {$floor:{$divide:['$lender_total','$emi_count']}},'$emi.extensionCharge']},
  //     accountName:{ $arrayElemAt: [ '$lender.bank.accName', 0] },
  //     accountNumber:{ $arrayElemAt: [ '$lender.bank.accNumber', 0] },
  //     accountIFSC:{ $arrayElemAt: [ '$lender.bank.ifsc', 0] },
  //   }
  // },{
  //   $match:{
  //       accountNumber:{$ne:''},
  //       accountIFSC:{$ne:''}
  //   }
  // }];
  // Loans.aggregate(aggregate,function(err,settlements){
  //   if(settlements && settlements.length>0){
  //     console.log(settlements);
  //     // res.json({settlements:settlements});
  //   }else{
  //     console.log(err);
  //     // res.json({success:false});
  //   }
  // });
  //     // ================================================================================================

  // var aggregateFees  = [{
  //     '$unwind':'$fees',
  //   }];
  // var aggregateFees  = [
  //   {
  //       $match: {
  //         '_lender': true,
  //       }
  //   },
  //   {
  //     $unwind:'$fees'
  //   },
  //   {
  //     $match: {
  //       'fees._paid': true,
  //     }
  //   }
  // ];

// // Users.find({},function(err , users){
// //     console.log(users.length);
// //     users.forEach(function(user) {
//       var aggregate  = [{
//         $match : {
//           // '_id': new mongoose.Types.ObjectId(user._id),
//           '_id': new mongoose.Types.ObjectId("58a59ab897bd79a11944d2ed"),
//         }
//       },{
//         $project : { 'fees' : 1,
//         'name': 1
//       }
//     },{
//       $unwind:'$fees'
//     },{
//       $match: {
//         'fees._paid': true,
//       }
//     }];
//     Users.aggregate(aggregate,function(err,feesss){
//       console.log(feesss);
//     });
// //   });
// // });

// var aggregateBorrowedUsers  = [{
//   $match : {
//     '_disbursed' : true,
//     '_deleted' : false,
//   }
// },{
//   $group : {
//     '_id' : "$userId"
//   }
// }];
//
// Loans.aggregate(aggregateBorrowedUsers,function(err,borrowers){                         // find total legal borrowers
//   if (borrowers) {
//     fs.unlink('public/AnalyticData/borrowersFeesDetail.csv', function(){
//       console.log('borrowersFeesDetail.csv deleted');
//     });
//     console.log(borrowers.length);
//     borrowers.forEach(function(borrowUser){
//       // sleep(2000);
//       var aggregate  = [{
//         $match : {
//           '_id': new mongoose.Types.ObjectId(borrowUser._id),
//         }
//       },{
//         $project : { 'fees' : 1,
//         'name' : 1,
//       }
//     },{
//       $unwind:'$fees'
//     },{
//       $match: {
//         'fees._paid': true,
//       }
//     }];
//
//     Users.aggregate(aggregate,function(err,user){                         // find total borrow loans per user
//       user.forEach(function(fees){
//         console.log(fees._id +","+ fees.name +","+moment(fees.fees.paid_date).format('DD/MM/YYYY')+","+fees.fees.amount +","+fees.fees.description);
//         csvdata = fees._id +","+ fees.name +","+moment(fees.fees.paid_date).format('DD/MM/YYYY')+","+fees.fees.amount +","+fees.fees.description +"\n";
//         fs.appendFile('public/AnalyticData/'+'borrowersFeesDetail.csv', csvdata,
//         function(err){
//
//         });
//       });
//     });
//   });
// }
// });
// // =================================================================================================================================================


        // var borrowedAmountAggregate  = [{
        //   $match: {
        //     '_disbursed': true,
        //   }
        // },
        // {
        //   $group: {
        //     _id: '',
        //     total: { $sum: '$amount' }
        //   }
        // }];
	// Users.aggregate(aggregate,function(err,fees){
	// 	// res.render('admins/fee',{fees:fees});
  //   console.log(fees);
	// });



//
//       Loans.aggregate(aggregate,function(err,borrowedLoans){                         // find total borrow loans per user
//         Loans.aggregate(borrowedAmountAggregate,function(err,borrowedAmount){        // sum of total amount of per user borrow loans
//           Loans.aggregate(emiAggregate,function(err,emis){                           // total emi per user
//             var delayDays = 0;
//             var earlyDays = 0;
//             emis.forEach(function(emi){
//               if (moment(emi.emi.paid_date).diff(emi.emi.due_date, 'days') > 0) {
//                 delayDays =  delayDays + moment(emi.emi.paid_date).diff(emi.emi.due_date, 'days');   // total all delay days of each emi
//               } else {
//                 earlyDays =  earlyDays + moment(emi.emi.paid_date).diff(emi.emi.due_date, 'days');   // total all delay days of each emi
//               }
//             });
//             // console.log(delayDays+"--"+earlyDays);                                                  // print delay days of each user
//             var firstLoanDate = NaN;
//             var borrowedTotalAmount = 0;
//             if (borrowedLoans.length) {
//               firstLoanDate = moment(borrowedLoans[0].disbursed_timestamp).format('MMMM');
//             }
//             if (borrowedAmount.length) {
//               borrowedTotalAmount = borrowedAmount[0].total;
//             }
//             console.log(user._id +","+ user.name +","+ user.city.replace(/ .*/,'') +","+ user.category +","+ moment(user.doj).format('DD/MM/YYYY') +","+ user.employee.income +","+ user.student.expenses +","+ firstLoanDate +","+ borrowedLoans.length +","+ borrowedTotalAmount +","+ earlyDays +","+ delayDays);
//             csvdata = user._id +","+ user.name +","+ user.city.replace(/ .*/,'') +","+ user.category +","+ moment(user.doj).format('DD/MM/YYYY') +","+ user.employee.income +","+ user.student.expenses +","+ firstLoanDate +","+ borrowedLoans.length +","+ borrowedTotalAmount +","+ earlyDays +","+ delayDays +"\n";
//             fs.appendFile('public/AnalyticData/'+'borrowersDetail.csv', csvdata,
//             function(err){
//
//             });
//           });
//         });
//       });
//     });
//   });
// });
// var input = '[{"name":"A","number":"*141#"},{"name":"Loan Aircel","number":"*414#"},{"name":"RAJAN PRIYDARSHI","number":"+91 6200 517 919"},{"name":"Ankit Bhaiya Jio","number":"+91 7001 757 107"},{"name":"Aanya","number":"+91 70076 08976"},{"name":"Aanya","number":"+91 70076 08976"},{"name":"Sumo Dgp","number":"+91 70310 49901"},{"name":"Avinash","number":"+91 70841 50071"},{"name":"Gokul Kalagara","number":"+91 72078 24353"},{"name":"Gokul Kalagara","number":"+91 72078 24353"},{"name":"Tatkaal Ticket Sadanand Tarya","number":"+91 73981 90915"},{"name":"Shubham Tiwari Bhopal","number":"+91 747 702 5253"},{"name":"Deepak Kumar Bihar","number":"+91 7484 003 961"},{"name":"Sirish Dgp","number":"+91 75518 55602"},{"name":"Prince","number":"+91 78975 60262"},{"name":"Prince","number":"+91 78975 60262"},{"name":"Ekta Jio","number":"+91 79 0511 5564"},{"name":"Shanwaj Inps","number":"+91 79 0550 4472"},{"name":"Shanwaj Inps","number":"+91 79 0550 4472"},{"name":"Neha vats","number":"+91 79 0908 9519"},{"name":"Ravikant","number":"+91 79 7763 9878"},{"name":"Ravikant","number":"+91 79 7763 9878"},{"name":"DGR AAKANKSHA","number":"+91 82995 53158"},{"name":"DGR AAKANKSHA","number":"+91 82995 53158"},{"name":"Himanshu Gupta","number":"+91 82995 97261"},{"name":"Himanshu Gupta","number":"+91 82995 97261"},{"name":"Himanshu","number":"+91 82995 97261"},{"name":"DGR UTTAM OMAR","number":"+91 82996 56020"},{"name":"DGR UTTAM OMAR","number":"+91 82996 56020"},{"name":"Krishna Kharwar....","number":"+91 83718 68653"},{"name":"Junior Manis kumar yadv","number":"+91 84232 17878"},{"name":"Junior Manis kumar yadv","number":"+91 84232 17878"},{"name":"Ronak Agrawal Bhopal","number":"+91 877 078 1817"},{"name":"Ronak Agrawal Bhopal","number":"+91 877 078 1817"},{"name":"Soumi $","number":"+91 877 701 4636"},{"name":"DGR ASHU RENU","number":"+91 878 943 4150"},{"name":"DGR ANJANI KUMAR","number":"+91 88253 98811"},{"name":"Prince","number":"+91 884 028 8308"},{"name":"Prince","number":"+91 884 028 8308"},{"name":"Jazaib Noomani Bhopal","number":"+91 88717 02482"},{"name":"Jazaib Noomani Bhopal","number":"+91 88717 02482"},{"name":"Abhay","number":"+91 89601 20921"},{"name":"Dhananjay Singh, Phd","number":"+91 90858 60038"},{"name":"Cogcon Hr Shuaib Akram","number":"+91 93937 94942"},{"name":"Junior Ashish MCA)","number":"+91 94245 44670"},{"name":"DGR ANJANI KUMAR","number":"+91 94313 13547"},{"name":"F PC Sir","number":"+91 94347 88196"},{"name":"F. A Sharma Sir","number":"+91 94347 89008"},{"name":"Tatkaal Ticket Sadanand Tarya","number":"+91 94543 18802"},{"name":"Tatkaal Ticket Sadanand Tarya","number":"+91 94543 18802"},{"name":"Dgp S Myank Verma","number":"+91 95639 71757"},{"name":"Junior Shubham Nit","number":"+91 96354 60583"},{"name":"Junior Subham Nitdgp","number":"+91 96354 60583"},{"name":"Amit Maddheshiya","number":"+91 96603 83073"},{"name":"Sk Johev Bhaiya","number":"+91 96749 67768"},{"name":"Almas Bhopal","number":"+91 96771 36490"},{"name":"Almas Bhopal","number":"+91 96771 36490"},{"name":"Aaditya Gupta","number":"+91 97175 63670"},{"name":"F. S D Sir","number":"+91 97342 94105"},{"name":"DIPANSHU SHARMA","number":"+91 98820 66407"},{"name":"DIPANSHU SHARMA","number":"+91 98820 66407"},{"name":"Shubham Tiwari Bhopal","number":"+91 99076 94242"},{"name":"Shubham Tiwari Bhopal","number":"+91 99076 94242"},{"name":"Rajat Yadav CEO","number":"+91 99520 67687"},{"name":"Ansari Kotak","number":"+91 99812 40519"},{"name":"Digital T.v.","number":"+913004719057"},{"name":"Ambulance Dgr","number":"+913432759111"},{"name":"Account No.","number":"+9150105585239"},{"name":"RAJAN PRIYDARSHI","number":"+916200517919"},{"name":"Jio Bhopali","number":"+917000082191"},{"name":"Jio Bhopali","number":"+917000082191"},{"name":"Ankit Bhaiya Jio","number":"+917001757107"},{"name":"Sanu Gupra Maharajganj","number":"+917031034990"},{"name":"Sanu Gupra Maharajganj","number":"+917031034990"},{"name":"Sanu Gupra Maharajganj","number":"+917031034990"},{"name":"Sumo Dgp","number":"+917031049901"},{"name":"Sumo Dgp","number":"+917031049901"},{"name":"Dgp S Shubham Majavdiya","number":"+917031534911"},{"name":"Dgp S Shubham Majavdiya","number":"+917031534911"},{"name":"Dgp S Mahesh Yadav","number":"+917031858691"},{"name":"Dgp S Mahesh Yadav","number":"+917031858691"},{"name":"Dgp S Praveen Kumar","number":"+917031939003"},{"name":"Dgp S Praveen Kumar","number":"+917031939003"},{"name":"Rahul Varun","number":"+917039515254"},{"name":"Dgp S Arpit Mishra","number":"+917076525078"},{"name":"Dgp S Arpit Mishra","number":"+917076525078"},{"name":"Dgp S Arpit Mishra","number":"+917076525078"},{"name":"Dgp S Abhishek Thakur","number":"+917076525079"},{"name":"Dgp S Abhishek Thakur","number":"+917076525079"},{"name":"Dgp S Abhishek Thakur","number":"+917076525079"},{"name":"Dgp S Abhishek Thakur","number":"+917076525079"},{"name":"Avinash","number":"+917084150071"},{"name":"Avinash","number":"+917084150071"},{"name":"Avinash","number":"+917084150071"},{"name":"DGR SURYA NAND SINGH","number":"+917098642908"},{"name":"DGR SURYA NAND SINGH","number":"+917098642908"},{"name":"DGR SURYA NAND SINGH","number":"+917098642908"},{"name":"DGR YOGESH SHUKLA","number":"+917098714490"},{"name":"DGR SHYAM SUNDAR KUMAR","number":"+917098719438"},{"name":"DGR SHYAM SUNDAR KUMAR","number":"+917098719438"},{"name":"Ekta..","number":"+917204719633"},{"name":"Ekta..","number":"+917204719633"},{"name":"Gokul Kalagara","number":"+917207824353"},{"name":"DGR SHYAM SUNDAR KUMAR","number":"+917209886584"},{"name":"DGR SHYAM SUNDAR KUMAR","number":"+917209886584"},{"name":"Shrish","number":"+917275388331"},{"name":"Shrish","number":"+917275388331"},{"name":"DGR SUJEET GUPTA","number":"+917275422964"},{"name":"DGR SUJEET GUPTA","number":"+917275422964"}]';
// console.log(input.replace(/"name"|"number"|"|{|}|:/g, ''));
//
// var str="D'Or, Megan#LastName Jr., FirstName#BMW, somename#What, new";
// str=str.replace(/,/g, '');
// console.log(str);

// // var jsdom = require('jsdom').jsdom;
// const JsDOM = require('jsdom').JSDOM;
// // let dom = new JsDOM(body);
// var fs = require('fs'),
// 	highcharts = require('node-highcharts'),
// 	options = {
// 		chart: {
// 			width: 300,
// 			height: 300,
// 			defaultSeriesType: 'bar'
// 		},
// 		legend: {
// 			enabled: false
// 		},
// 		title: {
// 			text: 'Highcharts rendered by Node!'
// 		},
// 		series: [{
// 			data: [ 1, 2, 3, 4, 5, 6 ]
// 		}]
// 	};
//
// highcharts.render(options, function(err, data) {
// 	if (err) {
// 		console.log('Error: ' + err);
// 	} else {
// 		fs.writeFile('chart.png', data, function() {
// 			console.log('Written to chart.png');
// 		});
// 	}
// });

// // ======================================================analysis_monthly_returns=======================================================
// // for monthly_return data file for alalytic dashboard
// // Run This Task in night 11 PM.
// // var analysis_monthly_returns = schedule.scheduleJob('30 17 * * *', function(next){
//   Users.find({'total_lent': { $gte: 0}},function(err , users){
//     var presentYear = parseInt(moment().format('YYYY'));
//     var presentMonth = parseInt(moment().format('M'));
//     var monthsArray = [];
//     for (var year = 2017; year <= presentYear; year++) {
//       for (var month = 1; (year == presentYear) ? (month <= presentMonth) : (month <= 12); month++) {
//         monthsArray.push(moment().month(month-1).year(year).format('MM/YYYY'));
//       }
//     }
//     fs.unlink('public/AnalyticData/monthlyRetuns.csv', function(){
//       console.log('monthlyRetuns.csv deleted');
//     });
//     console.log("user._id"+","+"user.name"+","+monthsArray.join(','));
//     csvdata = ""+","+""+","+monthsArray.join(',')+"\n";
//     fs.appendFile('public/AnalyticData/'+'monthlyRetuns.csv', csvdata,
//     function(err){
//
//     });
//     users.forEach(function(user) {
//       var aggregate  = [{
//         $match: {
//           'lenderId': new mongoose.Types.ObjectId(user._id),
//           '_disbursed': true,
//         }
//       },{
//         $unwind:'$emi'
//       }, {
//         $match: {
//           'emi._settled': true,
//           'emi._disbursed': true,
//         }
//       }];
//       var array = [];
//       Loans.aggregate(aggregate,function(err,emis){
//         for (var year = 2017; year <= presentYear; year++) {
//           for (var month = 1; (year == presentYear) ? (month <= presentMonth) : (month <= 12); month++) {
//             var totalMomtnlyRetun = 0;
//             emis.forEach(lentEmi);       //Call lentEmi function
//             array.push(totalMomtnlyRetun);              //Push Every month return amount
//           }
//         }
//
//         // Every month total returnsAmount amount 0f lender
//         function lentEmi(emi) {
//           if (emi.emi.processed_timestamp == null) {
//             if ( parseInt(moment(emi.emi.paid_date).format('YYYY')) == year && parseInt(moment(emi.emi.paid_date).format('M')) == month ) {
//               if (emi.emi.extensionCharge == null) {
//                 totalMomtnlyRetun = totalMomtnlyRetun + emi.lender_total/emi.emi_count + Math.round(emi.amount/emi.emi_count*0.05/31) * (moment(emi.emi.paid_date).diff(emi.emi.due_date, 'days')-3);
//               } else {
//                 totalMomtnlyRetun = totalMomtnlyRetun + emi.lender_total/emi.emi_count + emi.emi.extensionCharge;
//               }
//             }
//           } else {
//             if ( parseInt(moment(emi.emi.processed_timestamp).format('YYYY')) == year && parseInt(moment(emi.emi.processed_timestamp).format('M')) == month ) {
//               // totalMomtnlyRetun = totalMomtnlyRetun + emi.lender_total/emi.emi_count;
//               if (emi.emi.extensionCharge == null) {
//                 totalMomtnlyRetun = totalMomtnlyRetun + emi.lender_total/emi.emi_count + Math.round(emi.amount/emi.emi_count*0.05/31) * (moment(emi.emi.paid_date).diff(emi.emi.due_date, 'days')-3);
//               } else {
//                 totalMomtnlyRetun = totalMomtnlyRetun + emi.lender_total/emi.emi_count + emi.emi.extensionCharge;
//               }
//             }
//           }
//         }
//
//         console.log(user._id+","+user.name+","+array.join(','));
//         csvdata = user._id+","+user.name+","+array.join(',')+"\n";        //Data for csv separate by ,
//         fs.appendFile('public/AnalyticData/'+'monthlyRetuns.csv', csvdata,
//         function(err){
//
//         });
//       });
//     });
//   });
// // });
// // ============================================================================================================================

// // ======================================================analysis_monthly_lent=======================================================
// // for monthly_lent data file for alalytic dashboard
// // Run This Task every 1.00 AM
// // var analysis_monthly_lent = schedule.scheduleJob('30 19 * * *', function(next){
//   Users.find({'total_lent': { $gte: 0}},function(err , users){
//     var presentYear = parseInt(moment().format('YYYY'));
//     var presentMonth = parseInt(moment().format('M'));
//     var monthsArray = [];
//     for (var year = 2017; year <= presentYear; year++) {
//       for (var month = 1; (year == presentYear) ? (month <= presentMonth) : (month <= 12); month++) {
//         monthsArray.push(moment().month(month-1).year(year).format('MM/YYYY'));
//       }
//     }
//     fs.unlink('public/AnalyticData/monthlyLent.csv', function(){
//       console.log('monthlyLent.csv deleted');
//     });
//     console.log("user._id"+","+"user.name"+","+monthsArray.join(','));
//     csvdata = ""+","+""+","+monthsArray.join(',')+"\n";
//     fs.appendFile('public/AnalyticData/'+'monthlyLent.csv', csvdata,
//     function(err){
//
//     });
//     users.forEach(function(user) {
//       var aggregate  = [
//         {
//           $match: {
//             'lenderId': new mongoose.Types.ObjectId(user._id),
//             '_disbursed': true,
//           }
//         }
//       ];
//       var array = [];
//       Loans.aggregate(aggregate,function(err,lentLoans){
//         for (var year = 2017; year <= presentYear; year++) {
//           for (var month = 1; (year == presentYear) ? (month <= presentMonth) : (month <= 12); month++) {
//             var totalMomtnlyLent = 0;
//             lentLoans.forEach(lentLoansPerUser);       //Call lentLoansPerUser function
//             array.push(totalMomtnlyLent);              //Push Every monthlytotal
//           }
//         }
//
//         // Every month total lent amount for per lender
//         function lentLoansPerUser(loan) {
//           if ( parseInt(moment(loan.disbursed_timestamp).format('YYYY')) == year && parseInt(moment(loan.disbursed_timestamp).format('M')) == month ) {
//             if (loan.disbursed_timestamp == null) {
//               // console.log(loan.disbursed_timestamp);
//             } else {
//               totalMomtnlyLent = totalMomtnlyLent + loan.amount;
//             }
//           }
//         }
//
//         console.log(user._id+","+user.name+","+array.join(','));
//         csvdata = user._id+","+user.name+","+array.join(',')+"\n";        //Data for csv separate by ,
//         fs.appendFile('public/AnalyticData/'+'monthlyLent.csv', csvdata,
//         function(err){
//
//         });
//       });
//     });
//   });
// // });
// // ============================================================================================================================

// // Reminder smsgupshup Template
// // exports.otpTemplate = compile("http://enterprise.smsgupshup.com/GatewayAPI/rest?method=SendMessage&send_to={0}&msg=Your%20One%20Time%20Password(OTP)%20for%20the%20current%20session%20is%20{1}.%20Please%20do%20not%20share%20your%20OTP%20with%20anyone.%20Thank%20you%20for%20choosing%20Zup.&msg_type=TEXT&userid=2000150213&auth_scheme=plain&password=XVTaF0zUg&v=1.1&format=JSON");
// // var reminderTemplate = compile("http://enterprise.smsgupshup.com/GatewayAPI/rest?method=SendMessage&send_to={0}&msg=Your%20Z2P%20loan%20amt%20Rs.{1}%20is%20due%20on%20{2}.%20Kindly%20repay%20to%20avoid%20recovery%20actions%20%26%20penalty%20charges%20and%20to%20avail%20higher%20future%20loans.&msg_type=TEXT&userid=2000174181&auth_scheme=plain&password=1DG7Vd5wo&v=1.1&format=JSON");
// // var verifyMobile = compile("http://enterprise.smsgupshup.com/GatewayAPI/rest?method=SendMessage&send_to={0}&msg={1}%20is%20the%20Verification%20Code%20to%20allow%20%20{2}%20to%20add%20you%20{3}%20as%20association%20regarding%20Z2P%20loan%20account.&msg_type=TEXT&userid=2000174181&auth_scheme=plain&password=1DG7Vd5wo&v=1.1&format=JSON");
// var verifyMobile = compile("http://enterprise.smsgupshup.com/GatewayAPI/rest?method=SendMessage&send_to={0}&msg=Your%20loan%20of%20Rs3000%20is%20approved%20by%20Z2P.%20Please%20check%20your%20email%20inbox%28or%20spam%20folder%29%20for%20further%20instructions%20from%20us%20through%20our%20email%20contact%40z2p.today.&msg_type=TEXT&userid=2000174181&auth_scheme=plain&password=1DG7Vd5wo&v=1.1&format=JSON");
// var sendVerificationCode = function(phone,cb){
//   sms = verifyMobile(phone);
//   request({url: sms}, function (error, response, body) {
//     var res = JSON.parse(body);
//     console.log(res);
//     if(res.response.status == 'success'){
//       cb(true);
//     }else{
//       cb(false);
//     }
//   });
// };
//
// sendVerificationCode('8109522305', function(status){
//   if(status){
//     console.log("Approve Sms Sent");
//   }else{
//     console.log("Approve Sms Error");
//   }
// });

// Loan Approved Reminder smsgupshup Template
var ApproveReminderTemplate = compile("http://enterprise.smsgupshup.com/GatewayAPI/rest?method=SendMessage&send_to={0}&msg=Your%20loan%20of%20Rs.{1}%20is%20approved%20by%20Z2P.%20Please%20check%20your%20email%20inbox%28or%20spam%20folder%29%20for%20further%20instructions%20from%20us%20through%20our%20email%20contact%40z2p.today.&msg_type=TEXT&userid=2000150213&auth_scheme=plain&password=XVTaF0zUg&v=1.1&format=JSON");
var sendReminder = function(phone,dueAmount,cb){
  sms = ApproveReminderTemplate(phone,dueAmount);
  request({url: sms}, function (error, response, body) {
    var res = JSON.parse(body);
    console.log(res);
    if(res.response.status == 'success'){
      cb(true);
    }else{
      cb(false);
    }
  });
};

sendReminder(8109522305, 3000, function(status){
  if(status){
    console.log("Loan Approve Reminder Sent");
  }else{
    console.log("Loan Approve Reminder Error");
  }
});


//Edited by SujeetOffice


// sendEmail <- function(){
//
//   url <- "http://enterprise.smsgupshup.com/GatewayAPI/rest?method=SendMessage&send_to=8109522305&msg=Your%20loan%20of%20Rs.3000%20is%20approved%20by%20Z2P.%20Please%20check%20your%20email%20inbox%28or%20spam%20folder%29%20for%20further%20instructions%20from%20us%20through%20our%20email%20contact%40z2p.today.&msg_type=TEXT&userid=2000150213&auth_scheme=plain&password=XVTaF0zUg&v=1.1&format=JSON"
//
//   req <- httr::POST(url)
//
//   httr::stop_for_status(req)
//
//   TRUE
//
// }



// // ======================================================analysis_monthly_returns=======================================================
// // for monthly_return data file for alalytic dashboard
// // Run This Task in night 3.00 Am.
// // var analysis_monthly_returns = schedule.scheduleJob('30 21 * * *', function(next){
//   Users.find({'total_lent': { $gte: 0}},function(err , users){
//     fs.unlink('public/AnalyticData/monthlyExtension.csv', function(){
//       console.log('monthlyExtension.csv deleted');
//     });
//     var presentYear = parseInt(moment().format('YYYY'));
//     var presentMonth = parseInt(moment().format('M'));
//     var monthsArray = [];
//     for (var year = 2017; year <= presentYear; year++) {
//       for (var month = 1; (year == presentYear) ? (month <= presentMonth) : (month <= 12); month++) {
//         monthsArray.push(moment().month(month-1).year(year).format('MM/YYYY'));
//       }
//     }
//     console.log("user._id"+","+"user.name"+","+monthsArray.join(','));
//     csvdata = ""+","+""+","+monthsArray.join(',')+"\n";
//     fs.appendFile('public/AnalyticData/'+'monthlyExtension.csv', csvdata,
//     function(err){
//
//     });
//     users.forEach(function(user) {
//       var aggregate  = [{
//         $match: {
//           'lenderId': new mongoose.Types.ObjectId(user._id),
//           '_disbursed': true,
//         }
//       },{
//         $unwind:'$emi'
//       }, {
//         $match: {
//           'emi._settled': true,
//           'emi._disbursed': true,
//         }
//       }];
//       var array = [];
//       Loans.aggregate(aggregate,function(err,emis){
//         for (var year = 2017; year <= presentYear; year++) {
//           for (var month = 1; (year == presentYear) ? (month <= presentMonth) : (month <= 12); month++) {
//             var totalMomtnlyRetun = 0;
//             emis.forEach(lentEmi);                      //Call lentEmi function
//             array.push(totalMomtnlyRetun);              //Push Every month return amount
//           }
//         }
//
//         // Every month total returnsAmount amount 0f lender + extensionCharges
//         function lentEmi(emi) {
//           if (emi.emi.processed_timestamp == null) {
//             if ( parseInt(moment(emi.emi.paid_date).format('YYYY')) == year && parseInt(moment(emi.emi.paid_date).format('M')) == month ) {
//               if (emi.emi.extensionCharge == null) {
//                  if (moment(emi.emi.paid_date).diff(emi.emi.due_date, 'days') > 4) {
//                    totalMomtnlyRetun = totalMomtnlyRetun + Math.round(emi.amount/emi.emi_count*0.05/31) * (moment(emi.emi.paid_date).diff(emi.emi.due_date, 'days')-3);
//                  } else {
//                    totalMomtnlyRetun = totalMomtnlyRetun + 0;
//                  }
//               } else {
//                 totalMomtnlyRetun = totalMomtnlyRetun + emi.emi.extensionCharge;
//               }
//             }
//           } else {
//             if ( parseInt(moment(emi.emi.processed_timestamp).format('YYYY')) == year && parseInt(moment(emi.emi.processed_timestamp).format('M')) == month ) {
//               // totalMomtnlyRetun = totalMomtnlyRetun + emi.lender_total/emi.emi_count;
//               if (emi.emi.extensionCharge == null) {
//                 if (moment(emi.emi.paid_date).diff(emi.emi.due_date, 'days') > 4) {
//                   totalMomtnlyRetun = totalMomtnlyRetun + Math.round(emi.amount/emi.emi_count*0.05/31) * (moment(emi.emi.paid_date).diff(emi.emi.due_date, 'days')-3);
//                 } else {
//                   totalMomtnlyRetun = totalMomtnlyRetun + 0;
//                 }
//               } else {
//                 totalMomtnlyRetun = totalMomtnlyRetun + emi.emi.extensionCharge;
//               }
//             }
//           }
//         }
//
//         console.log(user._id.toString().slice(-6)+","+user._id.toString().slice(0,6)+","+user._id+","+user.name+","+array.join(','));
//         csvdata = user._id+","+user.name+","+array.join(',')+"\n";        //Data for csv separate by ,
//         fs.appendFile('public/AnalyticData/'+'monthlyExtension.csv', csvdata,
//         function(err){
//
//         });
//       });
//     });
//   });
// // });
// // ============================================================================================================================

// // Search pendingLoans Router
//
// 		Loans.find({_approved:false,_deleted:false}).populate({ path: 'userId', match:{comment:null}, select: 'name _paid comment' }).exec(function(err, loans){
//    console.log(loans);
//    loans.forEach(function(){
//
//    });
// 		});

// // =============================================================analysis_borrowers_Contacts_Detail==================================================
// //fetch borrowers Fees Details amount data file for alalytic dashboard
// // Run This Task every 5.00 AM Houres
//   console.log("Start analysis_borrowersContactDetails");
//   var aggregateBorrowedUsers  = [{
//     $match : {
//       '_disbursed' : true,
//       '_deleted' : false,
//     }
//   },{
//     $group : {
//       '_id' : "$userId"
//     }
//   }];
//
//   Loans.aggregate(aggregateBorrowedUsers,function(err,borrowers){                         // find total legal borrowers
//     if (borrowers) {
//       fs.unlink('public/AnalyticData/borrowersContactDetails.csv', function(){
//         console.log('borrowersContactDetails.csv deleted');
//       });
//       // console.log(borrowers.length);
//       borrowers.forEach(function(borrowUser){
//         // sleep(2000);
//         var aggregate  = [{
//           $match : {
//             '_id': new mongoose.Types.ObjectId(borrowUser._id),
//           }
//         },{
//           $project : {
//             'phone' : 1,
//             'email' : 1,
//             'name' : 1,
//           }
//         }];
//
//         Users.aggregate(aggregate,function(err,user){                         // find total borrow loans per user
//           // console.log(user);
//             console.log(user[0]._id +","+ user[0].name +","+ user[0].email +","+ user[0].phone);
//             csvdata = user[0]._id +","+ user[0].name +","+ user[0].email +","+ user[0].phone +"\n";
//             fs.appendFile('public/AnalyticData/'+'borrowersContactDetails.csv', csvdata,
//             function(err){
//
//             });
//         });
//       });
//     }
//   });
// // ==================================================================================================================================

// var debug = require('debug');
//
// debugWarm = debug('warm');
// debugError = debug('error');
//
// var data = {
// from: 'Z2P Support<contact@z2p.today>', //replace with your SMTP Login ID
// to: 'ankit@zup.today', // enter email Id to which email notification has to come.
// subject: "Z2P - Welcome to India's Fastest Loan Platform", //Subject Line
//       html: "<p style=\"color:red\"><b>Please read our recovery policy before proceeding</b>(Can be read in detail in FAQ and T&C):<br><b>1) We provide a maximum extension of 15 days post due date at charges of Rs120 per day.<br>2) In case of no communication or loan default, our recovery team will call and send message to your phone contacts.</b><br>By going forward, you give us the permission to carry out the same.</p><br>Hi "+ "user.name" +",<br><p>Congrats, your loan is approved! Based on your documents, your first time loan limit is <b>Rs " + "user.user_limit" + "</b>. We will keep increasing this limit after timely repayments and we welcome you to a lifetime membership on our platform where your limit will keep increasing as we grow together.<br><br><b>Steps to avail the loan:</b><br><br><big>Step1)</big>Pay the <b>\"One-time document processing fee\" of Rs 200</b>(Non Refundable) to the below bank details.This is just a one-time fee and you won't have to pay it again from next loan onwards.</p><b>Bank details to transfer:</b><br>Mode of Payment: IMPS<br>Bank Name: ICICI Bank<br>Account Type: Current<br>Account Name: Shujat Technologies Private Limited<br>Account number: 004005016952<br>IFSC Code: ICIC0000040<br>Branch: ISB CAMPUS, GACHIBOWLI, HYDERABAD<br><b>Update the following link after payment:<big>http://bit.ly/z2prepayment<big></b></address><br><br><big>Step2)</big>We disburse loans only via UPI. Please register on UPI through any app(http://bit.ly/z2pbhim) and update your UPI address in the Z2P app menu.<br><br><address><b>Regards,<br>Team Z2P</b></address>"};
// //  send mail
// mailgun.messages().send(data, function (error, body) {
// console.log(body);
// if(!error)
// console.log("Registration Mail Sent!");
// else
// console.log("Registration Mail not sent <br/>Error Message : "+error);
// });

// // router.get('/products/:page', function(req, res, next) {
//     var perPage = 10;
//     var page = 1;

//     Loans.find({lenderId:"58e1f3a35b64cc1b03277e37",_completed:false,_deleted:false,_disbursed:false}).skip((perPage * page) - perPage).limit(perPage).exec(function(err, products) {
//       Loans.count({lenderId:"58e1f3a35b64cc1b03277e37",_completed:false,_deleted:false,_disbursed:false}).exec(function(err, count) {
//         if (err) return next(err);
//         // res.render('main/products', {
//         //     products: products,
//         //     current: page,
//         //     pages: Math.ceil(count / perPage)
//         // });
//         console.log(products);
//         console.log(count);
//         console.log(Math.ceil(count / perPage));
//       });
//     });
// // });

// // module.exports.fetchLends = function(req, res, next) {
//   Loans.find({'lenderId':"58e1f3a35b64cc1b03277e37",_disbursed:true,_approved:true}).populate({ path: 'userId', select: 'vpa' }).skip((perPage * page) - perPage).limit(perPage).exec(function(err, loans) {
//     Loans.count({'lenderId':"58e1f3a35b64cc1b03277e37",_disbursed:true,_approved:true}).exec(function(err, count) {
//       if (err) return next(err);
//       console.log(loans);
//       console.log(count);
//       console.log(Math.ceil(count / perPage));
//     });
//   });
// // };

// Loans.find({'userId':"58b2699d97bd79a11944d360",$or: [ { _deleted:true }, { _completed:true } ]}).select('-emi').skip((perPage * page) - perPage).limit(perPage).exec(function(err, loans) {
//   Loans.find({'userId':"58b2699d97bd79a11944d360",$or: [ { _deleted:true }, { _completed:true } ]}).count(function(err, count) {
//     if (err) return next(err);
//     console.log(loans);
//     console.log(count);
//     console.log(Math.ceil(count / perPage));
//   });
//   });

// // ======================================================analysis_monthly_returns=======================================================
// // for monthly extension data file for alalytic dashboard
// // Run This Task in night 3.00 Am.
// var analysis_monthly_extension = schedule.scheduleJob('30 21 * * *', function(next){
//   Users.find({'total_lent': { $gte: 0}},function(err , users){
//     fs.unlink('public/AnalyticData/monthlyExtension.csv', function(){
//       console.log('monthlyExtension.csv deleted');
//     });
//     var presentYear = parseInt(moment().format('YYYY'));
//     var presentMonth = parseInt(moment().format('M'));
//     var monthsArray = [];
//     for (var year = 2017; year <= presentYear; year++) {
//       for (var month = 1; (year == presentYear) ? (month <= presentMonth) : (month <= 12); month++) {
//         monthsArray.push(moment().month(month-1).year(year).format('MM/YYYY'));
//       }
//     }
//     // console.log("user._id"+","+"user.name"+","+monthsArray.join(','));
//     csvdata = ""+","+""+","+monthsArray.join(',')+"\n";
//     fs.appendFile('public/AnalyticData/'+'monthlyExtension.csv', csvdata,
//     function(err){
//
//     });
//     users.forEach(function(user) {
//       var aggregate  = [{
//         $match: {
//           'lenderId': new mongoose.Types.ObjectId(user._id),
//           '_disbursed': true,
//         }
//       },{
//         $unwind:'$emi'
//       }, {
//         $match: {
//           'emi._settled': true,
//           'emi._disbursed': true,
//         }
//       }];
//       var array = [];
//       Loans.aggregate(aggregate,function(err,emis){
//         for (var year = 2017; year <= presentYear; year++) {
//           for (var month = 1; (year == presentYear) ? (month <= presentMonth) : (month <= 12); month++) {
//             var totalMomtnlyRetun = 0;
//             emis.forEach(lentEmi);                      //Call lentEmi function
//             array.push(totalMomtnlyRetun);              //Push Every month return amount
//           }
//         }
//
//         // Every month total extension charges of lender.
//         function lentEmi(emi) {
//           if (emi.emi.processed_timestamp == null) {
//             if ( parseInt(moment(emi.emi.paid_date).format('YYYY')) == year && parseInt(moment(emi.emi.paid_date).format('M')) == month ) {
//               if (emi.emi.extensionCharge == null) {
//                  if (moment(emi.emi.paid_date).diff(emi.emi.due_date, 'days') > 4) {
//                    totalMomtnlyRetun = totalMomtnlyRetun + Math.round(emi.amount/emi.emi_count*0.05/31) * (moment(emi.emi.paid_date).diff(emi.emi.due_date, 'days')-3);
//                  } else {
//                    totalMomtnlyRetun = totalMomtnlyRetun + 0;
//                  }
//               } else {
//                 totalMomtnlyRetun = totalMomtnlyRetun + emi.emi.extensionCharge;
//               }
//             }
//           } else {
//             if ( parseInt(moment(emi.emi.processed_timestamp).format('YYYY')) == year && parseInt(moment(emi.emi.processed_timestamp).format('M')) == month ) {
//               // totalMomtnlyRetun = totalMomtnlyRetun + emi.lender_total/emi.emi_count;
//               if (emi.emi.extensionCharge == null) {
//                 if (moment(emi.emi.paid_date).diff(emi.emi.due_date, 'days') > 4) {
//                   totalMomtnlyRetun = totalMomtnlyRetun + Math.round(emi.amount/emi.emi_count*0.05/31) * (moment(emi.emi.paid_date).diff(emi.emi.due_date, 'days')-3);
//                 } else {
//                   totalMomtnlyRetun = totalMomtnlyRetun + 0;
//                 }
//               } else {
//                 totalMomtnlyRetun = totalMomtnlyRetun + emi.emi.extensionCharge;
//               }
//             }
//           }
//         }
//
//         // console.log(user._id.toString().slice(-6)+","+user._id.toString().slice(0,6)+","+user._id+","+user.name+","+array.join(','));
//         csvdata = user._id+","+user.name+","+array.join(',')+"\n";        //Data for csv separate by ,
//         fs.appendFile('public/AnalyticData/'+'monthlyExtension.csv', csvdata,
//         function(err){
//
//         });
//       });
//     });
//   });
// });
// // ============================================================================================================================

// // function for counting words
// function count(str,char) {
// 	var re = new RegExp(char,"gi");
// 	return (str.match(re) || []).length;
// }
//
// pdf_path = '/home/ankit/z2pUploads'+'/'+'test.txt';
// fs.readFile(pdf_path, 'utf8', function (err,data) {
//   if (err) {
//     return console.log(err);
//   }
//   console.log(data.length);
//   console.log(count(data,"_id"));
//   console.log(count(data,"Ankit"));
// });

// var str = "Fame is the thirst of youth";
//
// // var result = str.match( /fame/i );
//
// console.log(str.split(' ')[0]);
// // console.log(str.split(([\w\-]+)));

// =====All files update timing=====
// pendingLoans.csv        16:30 10PM
// monthlyExtension.csv    17:30 11PM
// runningTotalAmount.csv  18:30 12AM
// lenderTotalAmount.csv   19:30 1AM
// monthlyLent.csv         20:30 2AM
// monthlyRetuns.csv       21:30 3AM
// borrowersFeesDetail.csv 22:30 4AM
// borrowersDetail.csv     23:30 5AM
// ==================================









// // ============================================analysis_pendingLoans_detail=============================================
// // pendingLoans data file for alalytic dashboard
// // Run This Task every 10.00 PM
// // var analysis_pendingLoans_detail = schedule.scheduleJob('30 16 * * *', function(next){
//   console.log("Start pendingLoans");
//   fs.unlink('public/AnalyticData/pendingLoans.csv', function(){
//     console.log('pendingLoans.csv deleted');
//   });
//   Loans.find({_approved:false,_deleted:false}).populate({ path: 'userId', select: 'name email user_limit comment phone' }).exec(function(err, loans){
//     console.log(loans[0]);
//     loans.forEach(function(loan){
//       if (moment().diff(loan.timestamp, 'days') < 40) {
//         console.log(loan._id +","+ loan.userId.name +","+ loan.userId.email +","+ loan.userId.phone +","+ moment(loan.timestamp).format('YYYY-MM-DD') +","+ loan.userId.user_limit +","+ loan.userId.comment);
//         csvdata = loan._id +","+ loan.userId.name +","+ loan.userId.email +","+ loan.userId.phone +","+ moment(loan.timestamp).format('YYYY-MM-DD') +","+ loan.userId.user_limit +","+ loan.userId.comment +"\n";
//         fs.appendFile('public/AnalyticData/'+'pendingLoans.csv', csvdata,
//         function(err) {
//
//         });
//       }
//     });
//   });
// // });

// // calculte contacts details
// // router.get('/contacts/:id',employeeValidate, function(req, res, next) {
// //   users.findOne({'_id':req.params.id},function(err,user){
//     var stats = [];
//     var total = 0;
//     var csv_path = '/home/ankit/z2pUploads'+'/'+'58e1f3a35b64cc1b03277e37calllog.csv';
//     // var csv_path = '/home/ankit/z2pUploads'+'/'+user._id+'.csv';
//     // var csv_path = '/home/ubuntu/z2p/public/uploads'+'/'+user._id+'.csv';
//
//     function addOrUpdate(item) {
//       console.log(item);
//       if (item[2] > 0) {
//         total = total + parseInt(item[2]);
//         stats.push(item);
//       }
//     }
//     // if(user._contacts) {
//       csv.fromPath(csv_path, {quote: null}).on("data", function(data){ addOrUpdate(data); }).on("end", function(){
//         // return res.json({success:true, contacts:stats.length});
//         console.log(stats.length);
//         console.log(total);
//         console.log(Math.round(total/stats.length));
//         console.log(total/stats.length);
//       });
//     // } else {
//     //   req.flash('pdf_info',"File is available but without contacts it will not work");
//     // }
// //   });
// // });
// var a = 1;
// console.log((a)?(a-1):0);

// Loans.find({_approved:false,_deleted:false,$or: [ {_priority:undefined}, {_priority:false}]},'userId amount total lender_total timestamp emi_count').populate({ path: 'userId', select: 'name _paid comment' }).exec(function(err, loans){
// console.log(loans);
// });

// Users.find({"phone": 8109522305},function(err, user){
//        console.log(user.auth_token);
//        // user.forEach(function(value){
//        //   console.log(value.type);
//        // });
// });
// Users.find({"phone":8109522305},{history: {$elemMatch: {'type':'personal'}}},function(err, user){
//        console.log(user);
// });



// var key = new NodeRSA({b: 512});
// var key = new NodeRSA();
// console.log(key.generateKeyPair(512));
// var key = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n'+
//                       'MIIBOQIBAAJAVY6quuzCwyOWzymJ7C4zXjeV/232wt2ZgJZ1kHzjI73wnhQ3WQcL\n'+
//                       'DFCSoi2lPUW8/zspk0qWvPdtp6Jg5Lu7hwIDAQABAkBEws9mQahZ6r1mq2zEm3D/\n'+
//                       'VM9BpV//xtd6p/G+eRCYBT2qshGx42ucdgZCYJptFoW+HEx/jtzWe74yK6jGIkWJ\n'+
//                       'AiEAoNAMsPqwWwTyjDZCo9iKvfIQvd3MWnmtFmjiHoPtjx0CIQCIMypAEEkZuQUi\n'+
//                       'pMoreJrOlLJWdc0bfhzNAJjxsTv/8wIgQG0ZqI3GubBxu9rBOAM5EoA4VNjXVigJ\n'+
//                       'QEEk1jTkp8ECIQCHhsoq90mWM/p9L5cQzLDWkTYoPI49Ji+Iemi2T5MRqwIgQl07\n'+
//                       'Es+KCn25OKXR/FJ5fu6A6A+MptABL3r8SEjlpLc=\n'+
//                       '-----END RSA PRIVATE KEY-----');
// var key = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n'+
// 'MIIEogIBAAKCAQEAgZPAEATKJk1boF6Y8UPHHwTl7Scrt1mwNn9aroYP5p/fhZoq50C8Rr/zJAxD\n'+
// 'aB+/LCUS59IxN3uDfDNNlt1egWVY16LirSY0fBXqnRrqQ0lnWYvLpHm5hh3Y71F0ylZc23MnhPdL\n'+
// 'ZVUT5czdIZ+jqMhXrbuaPcJ3fsWNWgL+2t4HNpxmK5dFrYq70eqgXbP+/fVXCcjn/Kw7sGHuT1Kd\n'+
// 'AStlxCIBmxFPTDS4BAfEeo8BZqskb/pV2tqCRLLQTfUA4dAqfrA7qItgkkDjmP8Kcx6kjIvN64L/\n'+
// 'ztaQSxSeLjfbwLfDMYjDckfwr1VuC7Fgt2QJ2ECpr2vDrT3+nsMh2QIDAQABAoIBACa7CAyBsf6y\n'+
// '3rFXtTVgQfNmnmc9bxa1yzLu7CcAUV5o6QHhK/PFaMFo/H8I31kPLDBAwJ7kN+vSkmGcYBO5BVd9\n'+
// '+Ikz2bdRlRyF3IOrGNyV4ztjyrHV5HtPDpmx6kvUdprtl6Fp3XJjdLgafPpg4iVABN0cFyVgrCEL\n'+
// 'YY3HGXBHv68R3ndM51ZzH5Kx4J6ooVgM6NqjYeyKot/jxL0j03PyaJPxTRYELXs54NPsQ6e73f4T\n'+
// 'Yd+uwv++yB07XImbYCGzp31QwefCeibtoAHna9ELQin8jl4OvLPKt17Buqfq1JKpf1szpwOvrgrs\n'+
// 'T4E1qgUF4AyS0jVGfBql1UFkSlECgYEA4vmv8fi5oNaGrXcoDmqrIyJ013r4hd+RKFkQySXjMh4b\n'+
// 'NZNMpWxhHljEw1ZLerFyqDDRJw9KUtt7kCj4eihxT6dlHJV6zN7zY7AA1pnV4yksv0zFP5/blIsv\n'+
// 'K+x3Um+AqdjbJXcB+F9dnKmXO9O+KTlMStNYyZ53Zv/WnHcKhBUCgYEAkiWdfJYkjwLDay7RUgYm\n'+
// 'kEk/loZ1yN9ti7jGHRYw4HEOEHSpLMdQAAewW1+9uzUnnf2tjqxOlvqx+N1VFZaZCWM/RazGx0SX\n'+
// 'CPQu5IDfqNgun1RB+H7k+Zz41U1Iw1cJT7VqjbKKofFVSOtaWMbuU31PXXGFLzHxj3XFlTYJg7UC\n'+
// 'gYBPY7xZ64CqND8ZL4NwP3kqqeOqdxW0ZbV1ImoPoVPtdMBZpfL6LYVuwufX1zhBaw3KrICLo/qA\n'+
// 'LsryapI20CyKCuf/7nzsadNB/A7fASHh+cXwB586mOSJ+YD/YQ9/Ywbi4boNSaoDwP+SS3Nddrud\n'+
// '2a/IwFHe+7GR8kyTn8Oq3QKBgHoviKOIw7ftD4Sk98wj6Enpc4hdkkwGwId4S+o1i1eaLbAEWQxe\n'+
// '9ruPshoyyWWi4yRr2pbV6D7CCdmO8nvCFOCMYXHXKbmf1sZdoHbaaCO52gDLaPxg2v72BfQPUS4/\n'+
// 'rkE943/kLZOHOU5ltntSlh6nPZtaNYdnshXG2RIOw5WhAoGAdgtHVH7rarV2KomOgTS5EuFm30Ue\n'+
// 'rApphYXnZX/W49ebfLnILpKK9nxcz+Sp3SX8nPmUB572V8IBR/WQ+hehIC9UOI2LH/cJbs3m2RJ/\n'+
// 'rMd9RpUiQKrsRnVlJb/1kdTTAy7ROfrTN8XGWnPZBjA1DTrIslfBiZSftcpGIcmaIgo=\n'+
// '-----END RSA PRIVATE KEY-----');
// var key = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n'+
// 'MIIBOgIBAAJBAKRGGq59Ky+hdTu/jJSvm1zsueldW0rIRbwOjUq3LOD4nTA8J9YA\n'+
// 'cfdy7i6U4DQfjinxH/z0vsGMIZJ97SNkkj0CAwEAAQJAdfmKy+lEjI5tvR0Rfu6m\n'+
// 'qxOvaHMNTyWJP0dMHW5zopSBnTNuGOeb75Dbx0wSd2GucKkmu6ZCnfzXylN4Os8H\n'+
// '2QIhAOGBBeHF7uTSuiUNxGJ0W9cdC0jRlKsadE7G0YGZFCLnAiEAun1JHmjOBmBM\n'+
// 'VQifLlRL7HjYh1nG4vLzXw34W9dhYTsCIQCarV50e8keabDG48eV5MxuI/zuiNtZ\n'+
// '9f5bXqKsK20VdwIgA4o1RRqALqbNTB/pxZtcBZUVpxwRJmWuMPO27ydbddkCIHH3\n'+
// 'VlcX6L8kDU5mcEtWtWyUMoifa0QLaus7WjqcMY1h\n'+
// '-----END RSA PRIVATE KEY-----');

// var  NodeRSA = require('node-rsa');
// var prikey = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n'+
// 'MIIBPAIBAAJBAM0BoHuVFc/KW+HIKMGulrj4X7yaFj1sWeIrlfsBhDOxa638ZfWw\n'+
// 'BVlTB7udUsuXDSqRazz0ZbNAM3oSBDguwckCAwEAAQJBAKut+BpmUHzSBz4+ZDtG\n'+
// 'nTxL68jC9Wr86Qzp2VD6BR9PrfpxARNKpk/+1U5vmsYZ37oOvuu3alV1Q6TuqOyZ\n'+
// '7oECIQDyqgZsdDj8UigfU58Mz0Qy/0izLibflIrDqfg2nvl4uQIhANhFzfcPZr+w\n'+
// 'sm/tKgs0lCo3Yaj079Ecd42D61YbiemRAiEAojr1THBu4JF0bW0UOhYfPBDbY58J\n'+
// 'MhQ2qRTq8mlZ01ECIDw7VJ1WALuqLkfVuTvdrNYFDoHLlW6biwAymTwl90bBAiEA\n'+
// 'hnUIPKtUuCpaKGf43+OTRk+dJaGYJpQhz5HSRM2hG7I=\n'+
// '-----END RSA PRIVATE KEY-----');
//
// var pubkey = new NodeRSA('-----BEGIN PUBLIC KEY-----\n'+
// 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAM0BoHuVFc/KW+HIKMGulrj4X7yaFj1s\n'+
// 'WeIrlfsBhDOxa638ZfWwBVlTB7udUsuXDSqRazz0ZbNAM3oSBDguwckCAwEAAQ==\n'+
// '-----END PUBLIC KEY-----');

// var text = 'Hello RSA!';
// var encrypted = prikey.encryptPrivate(text, 'base64', 'utf8');
// console.log('encrypted: ', encrypted);
// var decrypted = pubkey.decryptPublic(encrypted, 'utf8'); // use public key for decryption
// console.log('decrypted: ', decrypted);

// console.log("-----------------------");
// key.encrypt(buffer, [encoding], [source_encoding]);
// key.encryptPrivate(buffer, [encoding], [source_encoding]); // use private key for encryption
// console.log("-----------------------");

// var NodeRSA = require('node-rsa');
// // var key = new NodeRSA({b: 256});
// var key = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n'+
// 'MIGrAgEAAiEAkK4pko/49ki5Y+pbPhcaNjq8CGj+yQh/ww1NXwoNbaMCAwEAAQIg\n'+
// 'DiGEm/UF6wAlY1XjfYgCHj4qsutweZ7Gh/Hr/5OHzYECEQDMaadMYx7Xp0f5O+rP\n'+
// 'xt1jAhEAtTFryNhptfqRDo0if89CwQIRAKCKTgF5S4zVbXp6K2W56r8CEG0LVhOk\n'+
// 'clILftrkAzwp7sECEQDAHyI3oBjbUSSx0GZsQ5Z7=\n'+
// '-----END RSA PRIVATE KEY-----');
//
// var text = 'Hello RSA!';
// var encrypted = key.encrypt(text, 'base64');
// console.log('encrypted: ', encrypted);
// var decrypted = key.decrypt(encrypted, 'utf8');
// console.log('decrypted: ', decrypted);



// var aes256 = require('aes256');
// console.log("ankit");
// var masterkey = 'MDwwDQYJKoZIhvcNAQEBBQADKwAwKAIhAJCuKZKP+PZIuWPqWz4XGjY6vAho/skI\n'+
// 'f8MNTV8KD';
//
// var prikey = 'MIGrAgEAAiEAkK4pko/49ki5Y+pbPhcaNjq8CGj+yQh/ww1NXwoNbaMCAwEAAQIg\n'+
// 'DiGEm/UF6wAlY1XjfYgCHj4qsutweZ7Gh/Hr/5OHzYECEQDMaadMYx7Xp0f5O+rP\n'+
// 'xt1jAhEAtTFryNhptfqRDo0if89CwQIRAKCKTgF5S4zVbXp6K2W56r8CEG0LVhOk\n'+
// 'clILftrkAzwp7sECEQDAHyI3oBjbUSSx0GZsQ5Z7';
//
// var androidkey = 'MIGrAgEAAiEAkK4pko/49ki5Y+pbPhcaNjq8CGj+yQh/ww1NXwoNbaMCAwEAAQIgDiGEm/UF6wAlY1XjfYgCHj4qsutweZ7Gh/Hr/5OHzYECEQDMaadMYx7Xp0f5O+rPxt1jAhEAtTFryNhptfqRDo0if89CwQIRAKCKTgF5S4zVbXp6K2W56r8CEG0LVhOkclILftrkAzwp7sECEQDAHyI3oBjbUSSx0GZsQ5Z7';

//
// var encrypted_prikey = aes256.encrypt(masterkey, prikey);
// var decrypted_prikey = aes256.decrypt(masterkey, encrypted_prikey);
// console.log("---private---");
// console.log("encrypted private key:"+encrypted_prikey);
// console.log("---private---");
// // var key = 'my passphrase';
// var plaintext = 'my plaintext message';
//
// // var encrypted = aes256.encrypt(decrypted_prikey, plaintext);
// var encrypted = "xPivUfV5P3eqDo1LFsmnqN39soZA9bRZjYftMIvJ6tDWmrY5";
// console.log(encrypted);
// var decrypted = aes256.decrypt(decrypted_prikey, encrypted);
// console.log(decrypted);

// var aes256 = require('aes256');
// var androidkey = 'test123';
// var decryptedapp = aes256.decrypt(androidkey, 'KyY6F1lGfre66OGsrlcJD7+0OUGpUg8z6FzfQbfOjao=');
// console.log(decryptedapp);


// xPivUfV5P3eqDo1LFsmnqN39soZA9bRZjYftMIvJ6tDWmrY5

// Loans.find({'userId':"59425d8e5b64cc1b0386e480"}).select('_approved _disbursed _completed _deleted _defaulted').exec(
// function(err, loans) {
//   console.log(loans);
//   console.log(typeof(loans));
//
// if(loans!=null && loans.length > 0){
//   var last = loans.length;
//   console.log("last");
//   console.log(last);
//   console.log("last-1");
//   console.log(loans[last-1]);
//   if (loans[last-1]._deleted || loans[last-1]._completed) {
//     console.log("loans are not available");
//   } else {
//     console.log("loans are available");
//   }
// }else{
//   console.log("loans are not available");
// }
// });

// var text = 'Hello RSA!';
// var encrypted = prikey.encrypt(text, 'base64');
// console.log('encrypted: ', encrypted);
// var decrypted = prikey.decrypt(encrypted, 'utf8');
// console.log('decrypted: ', decrypted);

// //Loans
// // router.get('/pendingLoans',employeeValidate, function(req, res, next) {
// 	Loans.find({_approved:false,_deleted:false}).populate({ path: 'userId', select: 'name _paid comment' }).exec(function(err, loans){
//      console.log(loans);
//   });
// // });


// router.get('/emi',employeeValidate, function(req, res, next) {
	// var aggregate  = [{
	//     $match: {
  //         '_approved': false,
  //         '_deleted': false,
  //         'timestamp': {
  //                         $gte:new Date("2018-05-01"),
  //                         $lte:new Date("2018-05-05")
  //                       }
	//     }
	// }];
	// Loans.aggregate(aggregate,function(err,loans){
  //
  // console.log(loans);
	// });
// });

// var query = { name : 'ankit'};
// Loans.find({_completed:true}).populate({ path: 'userId', match:query, select: 'phone name' }).exec(function(err, loans){
//    console.log(loans);
// });

// var query = { name : 'ankit'};
// Loans.find({_approved:false, _deleted:false}).populate({ path: 'userId', match:query, select: 'phone name' }).exec(function(err, loans){
//    console.log(loans);
// });

// var query = { name: /.*ankit.*/i };
//
// Loans.find({_approved:false,_deleted:false}).populate({ path: 'userId', match:query, select: 'name _paid comment' }).exec(function(err, loans){
//      console.log(loans);
// });

// Loans.aggregate(aggregate,function(err,loans){
//   Loans.populate(loans,{ path: 'userId', select: 'name _paid comment' },function(err,loans){
//     // res.render('admins/emi',{emis:emis});
//      console.log(loans);
//   });
// });

// Users.find({'total_lent': { $gte: 0}},function(err , userss){
//   userss.forEach(function(user) {
//     var lastLoanDate  = [{
//       $match: {
//         'lenderId': new mongoose.Types.ObjectId(user._id),
//         '_disbursed': true,
//         // '_completed': true,
//       }
//     }
//   ];
//   Loans.aggregate(lastLoanDate,function(err,lentLoans){
//     if (lentLoans[lentLoans.length-1]) {
//       console.log(user._id+","+user.name+","+ moment(lentLoans[lentLoans.length-1].disbursed_timestamp).format('MMMM'));
//     }
//   });
// });
// });
//
// // ======================================================analysis_monthly_returns=======================================================
// // for monthly_return data file for alalytic dashboard
// // Run This Task in night 3.00 Am.
// // var analysis_monthly_returns = schedule.scheduleJob('30 21 * * *', function(next){
//   Users.find({'total_lent': { $gte: 0}},function(err , users){
//     fs.unlink('public/AnalyticData/monthlyExtension.csv', function(){
//       console.log('monthlyExtension.csv deleted');
//     });
//
//     console.log("user._id"+","+"user.name"+","+monthsArray.join(','));
//     csvdata = ""+","+""+","+monthsArray.join(',')+"\n";
//     fs.appendFile('public/AnalyticData/'+'monthlyExtension.csv', csvdata,
//     function(err){
//
//     });
//     users.forEach(function(user) {
//       var aggregate  = [{
//         $match: {
//           'lenderId': new mongoose.Types.ObjectId(user._id),
//           '_disbursed': true,
//         }
//       },{
//         $unwind:'$emi'
//       }, {
//         $match: {
//           'emi._settled': true,
//           'emi._disbursed': true,
//         }
//       }];
//       Loans.aggregate(aggregate,function(err,emis){
//         console.log(user._id.toString().slice(-6)+","+user._id.toString().slice(0,6)+","+user._id+","+user.name+","+array.join(','));
//         csvdata = user._id+","+user.name+","+array.join(',')+"\n";        //Data for csv separate by ,
//         fs.appendFile('public/AnalyticData/'+'monthlyExtension.csv', csvdata,
//         function(err){
//
//         });
//       });
//     });
//   });
// // });
// // ============================================================================================================================


	// Loans.find({_completed:true}).populate({ path: 'userId', select: 'name' }).populate({ path: 'lenderId', select: 'name' }).exec(function(err, loans){
  //   fs.unlink('public/AnalyticData/completedLoans.csv', function(){
  //     console.log('completedLoans.csv deleted');
  //   });
  //   loans.forEach(function(loan) {
  //   console.log(loan._id+","+loan.userId.name+","+loan.amount+","+loan.total+","+moment(loan.disbursed_timestamp).format("YYYY-MM-DD")+","+moment(loan.completed_timestamp).format("YYYY-MM-DD"));
  //   csvdata = loan._id+","+loan.userId.name+","+loan.amount+","+loan.total+","+moment(loan.disbursed_timestamp).format("YYYY-MM-DD")+","+moment(loan.completed_timestamp).format("YYYY-MM-DD")+"\n";
  //   fs.appendFile('public/AnalyticData/'+'completedLoans.csv', csvdata,
  //   function(err){
  //
  //   });
  //   });
  // });

	// Loans.find({_disbursed:true}).populate({ path: 'userId', select: 'name' }).populate({ path: 'lenderId', select: 'name' }).exec(function(err, loans){
  //   fs.unlink('public/AnalyticData/disbursedLoans.csv', function(){
  //     console.log('disbursedLoans.csv deleted');
  //   });
  //   loans.forEach(function(loan) {
  //   console.log(loan._id+","+loan.userId.name+","+loan.amount+","+loan.total+","+moment(loan.disbursed_timestamp).format("YYYY-MM-DD"));
  //   csvdata = loan._id+","+loan.userId.name+","+loan.amount+","+loan.total+","+moment(loan.disbursed_timestamp).format("YYYY-MM-DD")+"\n";
  //   fs.appendFile('public/AnalyticData/'+'disbursedLoans.csv', csvdata,
  //   function(err){
  //
  //   });
  //   });
  // });
// var pdftext = require('pdf-textstring');
//
//   // function for counting words
//   function count(str,char) {
//   	var re = new RegExp(char,"gi");
//   	return (str.match(re) || []).length;
//   }

// pdftext.pdftotext('public/Test-1.PDF', function (err, data) {
// if(err){
//   console.log(err);
//   res.json({success:false,error:err});
// }else{
//   var time0 = moment().subtract(0, 'month').format('MM/YYYY');
//   var time1 = moment().subtract(1, 'month').format('MM/YYYY');
//   var time2 = moment().subtract(2, 'month').format('MM/YYYY');
//   // console.log(time);
//
//   // console.log(data.length);
//   // var dat = data.toString().split(" ")
//   // console.log(dat.length);
//    // var dat = data.toString().replace(/\s{2,}/g,' ').split(" ");  // Remove all spaces
//
//   console.log(count(data,time0));
//   console.log(count(data,time1));
//   console.log(count(data,time2));
// }
// });
// var sbiBankFormat =
// var iciciBankFormat =
// var citiBankFormat =
// var citiBankFormat =
// var citiBankFormat =
// var citiBankFormat =
// console.log(moment().subtract(2, 'month').format('MM/YYYY'));
// console.log(moment().subtract(2, 'month').format('MM-YYYY'));
// console.log(moment().subtract(2, 'month').format('MM/YY'));
// console.log(moment().subtract(2, 'month').format('MMM-YYYY'));
// console.log(moment().subtract(2, 'month').format('MMM YYYY'));
//
// pdftext.pdftotext('public/Test-2.PDF', function (err, data) {
// if(err){
//   console.log(err);
//   res.json({success:false,error:err});
// }else{
//   var time0 = moment().subtract(0, 'month').format('MMM YYYY');
//   var time1 = moment().subtract(1, 'month').format('MMM YYYY');
//   var time2 = moment().subtract(2, 'month').format('MMM YYYY');
//   // console.log(time);
//
//   // console.log(data.length);
//   // var dat = data.toString().split(" ")
//   // console.log(dat.length);
//    // var dat = data.toString().replace(/\s{2,}/g,' ').split(" ");  // Remove all spaces
//
//   console.log(count(data,time0));
//   console.log(count(data,time1));
//   console.log(count(data,time2));
// }
// });

// var aggregate  = [{
//   $project: {
//     'fees': 1,
//   }
// },{
//   $match: {
//     '_id': new mongoose.Types.ObjectId("58f4d6655b64cc1b0333a7e1"),
//   }
// },{
//   $unwind:'$fees'
// }, {
//   $match: {
//     'fees._paid': false,
//     'fees.description': new RegExp('.*'+'extension'+'.*','i'),
//   }
// }];
//
// Users.aggregate(aggregate, function(err, fees) {
//   console.log(fees);
// });


// // ============================================analysis_borrower's_age_detail=============================================
// // for borrowersDetail data file for alalytic dashboard
// // var analysis_borrower's_age_detail = schedule.scheduleJob('*/5 * * * *', function(next){
// // This aggregateBorrowedUsers variable for find pure borrowedLoans
// var aggregateBorrowedUsers  = [{
//   "$match" :
//   {
//     '_disbursed' : true,
//     '_deleted' : false,
//   }
// },
// {
//   "$group": {
//     '_id': "$userId"
//   }
// }];
//
// Loans.aggregate(aggregateBorrowedUsers,function(err,borrowers){                         // find total legal borrowers
//   if (borrowers) {
//     fs.unlink('public/AnalyticData/borrowersAge.csv', function(){
//       console.log('borrowersAge.csv deleted');
//     });
//     console.log(borrowers.length);
//     csvdata = "userId" +","+ "userName" +","+ "age" +"\n";
//     fs.appendFile('public/AnalyticData/'+'borrowersAge.csv', csvdata,
//     function(err){
//
//     });
//     borrowers.forEach(function(borrowUser){
//       // sleep(2000);
//       var aggregate  = [{
//         $match: {
//           'userId': new mongoose.Types.ObjectId(borrowUser._id),
//           '_disbursed': true,
//         }
//       }];
//       Users.findOne({'_id':borrowUser._id},function(err,user){
//         var age = moment().diff(moment(user.dob, "MM/DD/YYYY"), 'years');
//         console.log(user._id +","+ user.name +","+ age);
//         csvdata = user._id +","+ user.name +","+ age +"\n";
//         fs.appendFile('public/AnalyticData/'+'borrowersAge.csv', csvdata,
//         function(err){
//
//         });
//       });
//     });
//   }
// });
// // });
// // =================================================================================================================================================

// // ============================================analysis_borrower's_contacts_detail=============================================
// // for borrowersDetail data file for alalytic dashboard
// // var analysis_borrower's_contacts_detail = schedule.scheduleJob('*/5 * * * *', function(next){
// // This aggregateBorrowedUsers variable for find pure borrowedLoans
// var aggregateBorrowedUsers  = [{
//   "$match" :
//   {
//     '_disbursed' : true,
//     '_deleted' : false,
//   }
// },
// {
//   "$group": {
//     '_id': "$userId"
//   }
// }];
//
// Loans.aggregate(aggregateBorrowedUsers,function(err,borrowers){                         // find total legal borrowers
//   if (borrowers) {
//     fs.unlink('public/AnalyticData/borrowersContact.csv', function(){
//       console.log('borrowersContact.csv deleted');
//     });
//     console.log(borrowers.length);
//     csvdata = "userId" +","+ "userName" +","+ "contacts" +"\n";
//     fs.appendFile('public/AnalyticData/'+'borrowersContact.csv', csvdata,
//     function(err){
//
//     });
//     borrowers.forEach(function(borrowUser){
//       sleep(1000);
//       Users.findOne({'_id':borrowUser._id},function(err,user){
//         if(user._contacts) {
//           var stats = [];
//           var csv_path = '/home/ankit/z2pUploads'+'/'+'58e1f3a35b64cc1b03277e37'+'.csv';
//           // var csv_path = '/home/ubuntu/z2p/public/uploads'+'/'+user._id+'.csv';
//
//           function addOrUpdate(item) {
//             var found = false;
//             for ( var i=0; i<stats.length; i++ ) {
//               if ( stats[i][0] === item[0] ) {
//                 found = true;
//                 break;
//               }
//             }
//             if ( false === found) {
//               stats.push(item);
//             }
//           }
//
//           csv.fromPath(csv_path, {quote: null}).on("data", function(data){ addOrUpdate(data); }).on("end", function(){
//             console.log(user._id +","+ user.name +","+ stats.length);
//             csvdata = user._id +","+ user.name +","+ stats.length +"\n";
//             fs.appendFile('public/AnalyticData/'+'borrowersContact.csv', csvdata,
//             function(err){
//
//             });
//           });
//         }
//       });
//     });
//   }
// });
// // });
// // =================================================================================================================================================

// // ============================================analysis_borrower's_callLog_detail=============================================
// // for borrowersDetail data file for alalytic dashboard
// // var analysis_borrower's_callLog_detail = schedule.scheduleJob('*/5 * * * *', function(next){
// // This aggregateBorrowedUsers variable for find pure borrowedLoans
// var aggregateBorrowedUsers  = [{
//   "$match" :
//   {
//     '_disbursed' : true,
//     '_deleted' : false,
//   }
// },
// {
//   "$group": {
//     '_id': "$userId"
//   }
// }];
//
// Loans.aggregate(aggregateBorrowedUsers,function(err,borrowers){                         // find total legal borrowers
//   if (borrowers) {
//     fs.unlink('public/AnalyticData/borrowersCallLog.csv', function(){
//       console.log('borrowersCallLog.csv deleted');
//     });
//     console.log(borrowers.length);
//     csvdata = "userId" +","+ "userName" +","+ "callLog" +","+ "Average" +"\n";
//     fs.appendFile('public/AnalyticData/'+'borrowersCallLog.csv', csvdata,
//     function(err){
//
//     });
//     borrowers.forEach(function(borrowUser){
//       sleep(1000);
//       Users.findOne({'_id':borrowUser._id},function(err,user){
//         if(user._calllog) {
//           var stats = [];
//           var total = 0;
//           var csv_path = '/home/ankit/z2pUploads'+'/'+'58e1f3a35b64cc1b03277e37calllog'+'.csv';
//           // var csv_path = '/home/ubuntu/z2p/public/uploads'+'/'+user._id+'calllog.csv';
//
//           // Count number of rows and sum 3rd column
//           function addOrUpdate(item) {
//             if (item[2] > 0) {
//               total = total + parseInt(item[2]);
//               stats.push(item);
//             }
//           }
//
//           csv.fromPath(csv_path, {quote: null}).on("data", function(data){ addOrUpdate(data); }).on("end", function(){
//             console.log(user._id +","+ user.name +","+ stats.length +","+ Math.round(total/stats.length));
//             csvdata = user._id +","+ user.name +","+ stats.length +","+ Math.round(total/stats.length) +"\n";
//             fs.appendFile('public/AnalyticData/'+'borrowersCallLog.csv', csvdata,
//             function(err){
//
//             });
//           });
//         }
//       });
//     });
//   }
// });
// // });
// // =================================================================================================================================================

// // ============================================analysis_borrower's_messeges_detail=============================================
// // for borrowersDetail data file for alalytic dashboard
// // var analysis_borrower's_messeges_detail = schedule.scheduleJob('*/5 * * * *', function(next){
// // This aggregateBorrowedUsers variable for find pure borrowedLoans
//
// // function for counting words
// function count(str,char) {
//   var re = new RegExp(char,"gi");
//   return (str.match(re) || []).length;
// }
//
// var aggregateBorrowedUsers  = [{
//   "$match" :
//   {
//     '_disbursed' : true,
//     '_deleted' : false,
//   }
// },
// {
//   "$group": {
//     '_id': "$userId"
//   }
// }];
//
// Loans.aggregate(aggregateBorrowedUsers,function(err,borrowers){                         // find total legal borrowers
//   if (borrowers) {
//     fs.unlink('public/AnalyticData/borrowersMesseges.csv', function(){
//       console.log('borrowersMesseges.csv deleted');
//     });
//     console.log(borrowers.length);
//     csvdata = "userId" +","+ "userName" +","+ "Messeges" +","+ "FirstName" +","+ "Your order" +","+ "Amazon" +","+ "Flipkart" +","+ "received" +","+ "added" +","+ "paytm wallet" +","+ "paytm" +","+ "sent" +","+ "paid" +","+
//     "Oyo" +","+ "makemytrip" +","+ "goibibo" +","+ "Ola" +","+ "Uber" +","+ "Ride" +","+ "Indigo" +","+ "flight" +","+ "IRCTC" +","+ "mmt" +","+
//     "Loan" +","+ "Default" +","+ "Credit Card" +","+ "Recovery" +","+
//     "Cashe" +","+ "Early Salary" +","+ "Faircent" +","+ "i2i" +","+ "Bajaj" +","+ "Capital" +","+
//     "Kamine" +","+ "Saala" +","+ "Saale" +","+ "Kutte" +","+ "Chutiya" +","+ "Chutiye" +","+ "bhenchod" +","+ "Gandu" +","+ "bhosdike" +","+ "Fuck" +","+ "Asshole" +","+ "motherfucker" +","+ "madarchod" +","+ "lavde" +","+ "laode" +","+ "lode" +","+
//     "debited" +","+ "credited" +"\n";
//     fs.appendFile('public/AnalyticData/'+'borrowersMesseges.csv', csvdata,
//     function(err){
//
//     });
//     borrowers.forEach(function(borrowUser){
//       sleep(1000);
//       Users.findOne({'_id':borrowUser._id},function(err,user){
//         if(user._messages) {
//
//           var pdf_path = '/home/ankit/z2pUploads'+'/'+'58e1f3a35b64cc1b03277e37'+'.txt';
//           // var pdf_path = '/home/ubuntu/z2p/public/uploads'+'/'+user._id+'.txt';
//           fs.readFile(pdf_path, 'utf8', function (err,data) {
//             // return res.json({messageCount:count(data,"_id"),nameCount:count(data,user.name.split(' ')[0])});
//             console.log(user._id +","+ user.name +","+ count(data,"_id")+","+ count(data,'ankit'.split(' ')[0])+","+
//             count(data,'Your order')+","+ count(data,'Amazon')+","+ count(data,'Flipkart')+","+ count(data,'received')+","+ count(data,'added')+","+ count(data,'paytm wallet')+","+ count(data,'paytm')+","+ count(data,'sent')+","+ count(data,'paid')+","+
//             count(data,'Oyo')+","+ count(data,'makemytrip')+","+ count(data,'goibibo')+","+ count(data,'Ola')+","+ count(data,'Uber')+","+ count(data,'Ride')+","+ count(data,'Indigo')+","+ count(data,'flight')+","+ count(data,'IRCTC')+","+ count(data,'mmt')+","+
//             count(data,'Loan')+","+ count(data,'Default')+","+ count(data,'Credit Card')+","+ count(data,'Recovery')+","+
//             count(data,'Cashe')+","+ count(data,'Early Salary')+","+ count(data,'Faircent')+","+ count(data,'i2i')+","+ count(data,'Bajaj')+","+ count(data,'Capital')+","+
//             count(data,'Kamine')+","+ count(data,'Saala')+","+ count(data,'Saale')+","+ count(data,'Kutte')+","+ count(data,'Chutiya')+","+ count(data,'Chutiye')+","+ count(data,'bhenchod')+","+ count(data,'Gandu')+","+ count(data,'bhosdike')+","+ count(data,'Fuck')+","+ count(data,'Asshole')+","+ count(data,'motherfucker')+","+ count(data,'madarchod')+","+ count(data,'lavde')+","+ count(data,'laode')+","+ count(data,'lode')+","+
//             count(data,'debited')+","+ count(data,'credited'));
//             csvdata = user._id +","+ user.name +","+ count(data,"_id")+","+ count(data,'ankit'.split(' ')[0])+","+
//             count(data,'Your order')+","+ count(data,'Amazon')+","+ count(data,'Flipkart')+","+ count(data,'received')+","+ count(data,'added')+","+ count(data,'paytm wallet')+","+ count(data,'paytm')+","+ count(data,'sent')+","+ count(data,'paid')+","+
//             count(data,'Oyo')+","+ count(data,'makemytrip')+","+ count(data,'goibibo')+","+ count(data,'Ola')+","+ count(data,'Uber')+","+ count(data,'Ride')+","+ count(data,'Indigo')+","+ count(data,'flight')+","+ count(data,'IRCTC')+","+ count(data,'mmt')+","+
//             count(data,'Loan')+","+ count(data,'Default')+","+ count(data,'Credit Card')+","+ count(data,'Recovery')+","+
//             count(data,'Cashe')+","+ count(data,'Early Salary')+","+ count(data,'Faircent')+","+ count(data,'i2i')+","+ count(data,'Bajaj')+","+ count(data,'Capital')+","+
//             count(data,'Kamine')+","+ count(data,'Saala')+","+ count(data,'Saale')+","+ count(data,'Kutte')+","+ count(data,'Chutiya')+","+ count(data,'Chutiye')+","+ count(data,'bhenchod')+","+ count(data,'Gandu')+","+ count(data,'bhosdike')+","+ count(data,'Fuck')+","+ count(data,'Asshole')+","+ count(data,'motherfucker')+","+ count(data,'madarchod')+","+ count(data,'lavde')+","+ count(data,'laode')+","+ count(data,'lode')+","+
//             count(data,'debited')+","+ count(data,'credited') +"\n";
//             fs.appendFile('public/AnalyticData/'+'borrowersMesseges.csv', csvdata,
//             function(err){
//
//             });
//           });
//         }
//       });
//     });
//   }
// });
// // });
// // =================================================================================================================================================

// ============================================analysis_borrower's_callLog_frequency_detail=============================================
// for borrowersDetail data file for alalytic dashboard
// var analysis_borrower's_callLog_frequency_detail = schedule.scheduleJob('*/5 * * * *', function(next){
// This aggregateBorrowedUsers variable for find pure borrowedLoans

// // function for counting words
// function count(str,char) {
//   var re = new RegExp(char,"gi");
//   return (str.match(re) || []).length;
// }
//
// var aggregateBorrowedUsers  = [{
//   "$match" :
//   {
//     '_disbursed' : true,
//     '_deleted' : false,
//   }
// },
// {
//   "$group": {
//     '_id': "$userId"
//   }
// }];
//
// Loans.aggregate(aggregateBorrowedUsers,function(err,borrowers){                         // find total legal borrowers
//   if (borrowers) {
//     fs.unlink('public/AnalyticData/borrowersCallLogFrequency.csv', function(){
//       console.log('borrowersCallLogFrequency.csv deleted');
//     });
//     console.log(borrowers.length);
//     csvdata = "userId" +","+ "userName" +","+ "papa" +","+ "dad"+","+ "baba"+","+ "appa"+","+ "anna"+","+ "abbu"+","+ "father"+","+ "home"+","+ "ghar"+","+ "pappa"+","+
//      "mummy"+","+ "maa"+","+ "amma"+","+ "aayi"+","+ "ayi"+","+ "ammi"+","+ "mother"+","+ "mammi"+","+
//      "sister"+","+ "didi"+","+ "bhai"+","+ "bro"+","+ "nani"+","+ "bhabhi"+","+ "nana"+","+
//      "Company" +"\n";
//     fs.appendFile('public/AnalyticData/'+'borrowersCallLogFrequency.csv', csvdata,
//     function(err){
//
//     });
//     borrowers.forEach(function(borrowUser){
//       sleep(1000);
//       Users.findOne({'_id':borrowUser._id},function(err,user){
//         if(user._calllog) {
//
//           var pdf_path = '/home/ankit/z2pUploads'+'/'+'58e1f3a35b64cc1b03277e37calllog'+'.csv';
//           // var pdf_path = '/home/ubuntu/z2p/public/uploads'+'/'+user._id+'calllog.csv';
//           fs.readFile(pdf_path, 'utf8', function (err,data) {
//             console.log(user._id +","+ user.name +","+ count(data, 'papa') +","+ count(data, 'dad')+","+ count(data, 'baba')+","+ count(data, 'appa')+","+ count(data, 'anna')+","+ count(data, 'abbu')+","+ count(data, 'father')+","+ count(data, 'home')+","+ count(data, 'ghar')+","+ count(data, 'pappa')+","+
//             count(data, 'mummy')+","+ count(data, 'maa')+","+ count(data, 'amma')+","+ count(data, 'aayi')+","+ count(data, 'ayi')+","+ count(data, 'ammi')+","+ count(data, 'mother')+","+ count(data, 'mammi')+","+
//             count(data, 'sister')+","+ count(data, 'didi')+","+ count(data, 'bhai')+","+ count(data, 'bro')+","+ count(data, 'nani')+","+ count(data, 'bhabhi')+","+ count(data, 'nana')+","+
//             count(data, user.employee.company_name));
//             csvdata = user._id +","+ user.name +","+ count(data, 'papa') +","+ count(data, 'dad')+","+ count(data, 'baba')+","+ count(data, 'appa')+","+ count(data, 'anna')+","+ count(data, 'abbu')+","+ count(data, 'father')+","+ count(data, 'home')+","+ count(data, 'ghar')+","+ count(data, 'pappa')+","+
//             count(data, 'mummy')+","+ count(data, 'maa')+","+ count(data, 'amma')+","+ count(data, 'aayi')+","+ count(data, 'ayi')+","+ count(data, 'ammi')+","+ count(data, 'mother')+","+ count(data, 'mammi')+","+
//             count(data, 'sister')+","+ count(data, 'didi')+","+ count(data, 'bhai')+","+ count(data, 'bro')+","+ count(data, 'nani')+","+ count(data, 'bhabhi')+","+ count(data, 'nana')+","+
//             count(data, user.employee.company_name) +"\n";
//             fs.appendFile('public/AnalyticData/'+'borrowersCallLogFrequency.csv', csvdata,
//             function(err){
//
//             });
//           });
//         }
//       });
//     });
//   }
// });
// // });
// // =================================================================================================================================================


// // function for counting words
// function count(str,char) {
//   var re = new RegExp(char,"gi");
//   return (str.match(re) || []).length;
// }
//
// var pdf_path = '/home/ankit/z2pUploads'+'/'+'58e1f3a35b64cc1b03277e37'+'.csv';
// // var pdf_path = '/home/ubuntu/z2p/public/uploads'+'/'+user._id+'.txt';
// fs.readFile(pdf_path, 'utf8', function (err,data) {
//   console.log(count(data,'papa'));
// });

// Users.findOne({'fees._id':'58d61f4432c8da06e99633a0'},function(err, fee) {
//   console.log(fee);
//   // req.flash('error','User '+user.name+' has been Successfully Deleted.');
//   // res.redirect('/admins/employees');
// });

// Users.update({'_id':"58e0a53d5b64cc1b0326cb6f"},{$pull:{fees: {'_id':"58e3657b774d5537ad482a0e"}}},function(err,data){
//   console.log(data);
// });

//
// var https = require('https');
// var http = require('http');

// /**
//  * HOW TO Make an HTTP Call - POST
//  */
// // do a POST request
// // create the JSON object
// jsonObject = JSON.stringify({
//     "message" : "The web of things is approaching, let do some tests to be ready!",
//     "name" : "Test message posted with node.js",
//     "caption" : "Some tests with node.js",
//     "link" : "http://www.youscada.com",
//     "description" : "this is a description",
//     "picture" : "http://youscada.com/wp-content/uploads/2012/05/logo2.png",
//     "actions" : [ {
//         "name" : "youSCADA",
//         "link" : "http://www.youscada.com"
//     } ]
// });
//
// // prepare the header
// var postheaders = {
//     'Content-Type' : 'application/json',
//     'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
// };
//
// // the post options
// var optionspost = {
//     host : 'http://localhost:5090',
//     port : 443,
//     path : '/users/bankList',
//     method : 'POST',
//     headers : postheaders
// };
//
// console.info('Options prepared:');
// console.info(optionspost);
// console.info('Do the POST call');
//
// // do the POST call
// var reqPost = https.request(optionspost, function(res) {
//     console.log("statusCode: ", res.statusCode);
//     // uncomment it for header details
// //  console.log("headers: ", res.headers);
//
//     res.on('data', function(d) {
//         console.info('POST result:\n');
//         process.stdout.write(d);
//         console.info('\n\nPOST completed');
//     });
// });
//
// // write the json data
// reqPost.write(jsonObject);
// reqPost.end();
// reqPost.on('error', function(e) {
//     console.error(e);
// });

// var http=require('http');
//   http.get('http://localhost:5090/users/bankList', function(res){
//        var str = '';
//        console.log('Response is '+res.statusCode);
//
//        // res.on('data', function (chunk) {
//        //        str += chunk;
//        //  });
//        //
//        // res.on('end', function () {
//        //      console.log(str);
//        // });
//
//  });

// // We need this to build our post string
// var querystring = require('querystring');
// var http = require('http');
// var fs = require('fs');
//
//
//   // Build the post string from an object
//   var post_data = querystring.stringify({
//       'compilation_level' : 'ADVANCED_OPTIMIZATIONS',
//       'output_format': 'json',
//       'output_info': 'compiled_code',
//         'warning_level' : 'QUIET',
//   });
//
//   // An object of options to indicate where to post to
//   var post_options = {
//       host: 'http://localhost:5090',
//       port: '22',
//       path: '/users/bankList',
//       method: 'POST',
//       headers: {
//           'Content-Type': 'application/json',
//           'Content-Length': Buffer.byteLength(post_data)
//       }
//   };
//
//   // Set up the request
//   http.request(post_options, function(res) {
//       res.setEncoding('utf8');
//       res.on('data', function (chunk) {
//           console.log('Response: ' + chunk);
//       });
//   });

  // // post the data
  // post_req.write(post_data);
  // post_req.end();


// // This is an async file read
// fs.readFile('LinkedList.js', 'utf-8', function (err, data) {
//   if (err) {
//     // If this were just a small part of the application, you would
//     // want to handle this differently, maybe throwing an exception
//     // for the caller to handle. Since the file is absolutely essential
//     // to the program's functionality, we're going to exit with a fatal
//     // error instead.
//     console.log("FATAL An error occurred trying to read in the file: " + err);
//     process.exit(-2);
//   }
//   // Make sure there's data before we post it
//   if(data) {
//     PostCode(data);
//   }
//   else {
//     console.log("No data to post");
//     process.exit(-1);
//   }
// });

// var http = require("http");
// var options = {
//   hostname: 'localhost',
//   port: 5090,
//   path: '/users/bankList',
//   method: 'POST',
//   headers: {
//       'Content-Type': 'application/json',
//       authorization: 'Ankit',
//   }
// };
// var req = http.request(options, function(res) {
//   console.log('Status: ' + res.statusCode);
//   console.log('Headers: ' + JSON.stringify(res.headers));
//   res.setEncoding('utf8');
//   res.on('data', function (body) {
//     console.log('Body: ' + body);
//   });
// });
// req.on('error', function(e) {
//   console.log('problem with request: ' + e.message);
// });
// // write data to request body
// req.write('{"string": "Hello, World"}');
// req.end();




// var base64 = require('file-base64');
// base64.encode('Z2P-Invest.pdf', function(err, base64String) {
//   console.log("----------");
//   console.log(base64String);
//   console.log("----------");
// });














//
// var options = {
//   method: 'POST',
//   url: 'http://52.77.240.139:5090/users/pdfAnalysis',
//   headers:
//   {
//     'content-type': 'application/json',
//     authorization: 'Ankit'
//   },
//   body:
//   {
//     userName: 'shahul',
//     bankName: 'idbi',
//     bankStatement: 'K'
//   },
//   json: true,
// };
//
// request(options, function (error, response, body) {
//   if (error) throw new Error(error);
//   console.log(body);
// });


// var mt940js = require('mt940js');
// var parser  = new mt940js.Parser();
//
// var statements = parser.parse(fs.readFileSync('public/Test-1.PDF', 'utf8'));
// console.log(statements);

// var Banking = require('banking');
// Banking.parseFile('public/Test-1.PDF', function (res) {
//   console.log(res);
// });

// var parser = new HsbcStatementParser();
// parser.parseFile('public/Test-1.PDF', function(err, sta){
// 	if (err)
// 		console.error(err.stack);
// 	else {
// 	  console.log("parsed " + sta.ops.length + " operations");
// 	  console.log("closing balance: " + sta.balTo);
// 	}
// });

// var resumePdfToJson = require('resume-pdf-to-json');
//
// var path = 'public/Test-1.PDF';
//
// var a = resumePdfToJson(path)
//     .then(function(data) {
//    console.log(data);
//     });


// var pdfText = require('pdf-text')
//
// // var pathToPdf = __dirname + "/info.pdf"
// var pathToPdf = 'public/Test-2.PDF'
//
// pdfText(pathToPdf, function(err, chunks) {
//   //chunks is an array of strings
//   //loosely corresponding to text objects within the pdf
//
//   //for a more concrete example, view the test file in this repo
// })
//
// //or parse a buffer of pdf data
// //this is handy when you already have the pdf in memory
// //and don't want to write it to a temp file
// var fs = require('fs')
// var buffer = fs.readFileSync(pathToPdf)
// pdfText(buffer, function(err, chunks) {
//    console.log(chunks);
// })

// pdftext.pdftotext('public/Test-3.PDF', function (err, data) {
//   if(err){
//     console.log(err);
//     res.json({success:false,error:err});
//   }else{
// console.log(data.length);
// // console.log(data);
// // data.forEach(function(word){
// //   console.log(word);
// // });
//    for (var i = 0; i < data.length; i++) {
//     console.log(data[i]);
//     csvdata = data[i]+"\n";
//                 fs.appendFile('public/AnalyticData/'+'kotak2.csv', csvdata,
//                 function(err){
//
//                 });
//    }
//     }
//   });

  // Users.find({'lastLogin': { $gt: new Date("2018-06-01")}},'lastLogin', function(err, user) {
	// 	if(user!=null){
  //     console.log(user.length);
  //     // user.forEach(function(userFcmId){
  //     //   console.log(userFcmId.lastLogin);
  //     // });
  //   }
  // });

  // Users.find({},'lastLogin', function(err, user) {
	// 	if(user!=null){
  //     console.log(user.length);
  //     user.forEach(function(userFcmId){
  //       console.log(userFcmId.lastLogin);
  //     });
  //   }
  // });

// var isodate = require("isodate");
//
// // Read a date string
// var date = isodate("2011-08-20T19:39:52Z");
// console.log(date);
//
// // Write current date as ISO 8601 string.
// date = new Date();
// console.log(date.toISOString());

// router.get('/emi',employeeValidate, function(req, res, next) {
	// var aggregate  = [{
	//     $match: {
  //         '_approved': false,
  //         '_deleted': false,
  //         'timestamp': {
  //                         $gte:new Date("2018-05-01"),
  //                         $lte:new Date("2018-05-05")
  //                       }
	//     }
	// }];
	// Loans.aggregate(aggregate,function(err,loans){
  //
  // console.log(loans);
	// });
// });



// var aggregate  = [{
//   $match: {
//     '_otp.timestamp' : { $gt: new Date('2018-03-03'), }
//   }
// }];
//
// console.log(aggregate);
// console.log(moment());
//
// Users.aggregate(aggregate,function(err,user){
//   console.log(user);
// });

// Users.find({'_otp.timestamp': { $gt: new Date(moment().subtract(32, 'days').format('YYYY-MM-DD'))}},'fcmId', function(err, user) {
// 	if(user!=null){
//     console.log(user.length);
//     // for (var i = 0; i < user.length; i++) {
//     //
//     //   console.log(user[i].fcmId);
//     // }
//   }
// });

// request({
//   method: 'POST',
//   url:"https://fcm.googleapis.com/fcm/send",
//   headers:{
//     'Content-Type':'application/json',
//     'Authorization': 'key=AIzaSyByrPOWGFUZZiZn0c15ICko7OJHBQgfKMs'
//   },
//   json:{
//     "registration_ids": ["cmdunLYSdYM:APA91bGV9wYXKvuQQS8i7w-iSMyeAw-k8mIrl3_axMkYa_ir2aPkZaMd1WEia1uqkv3cDA6gPE7RRAdW8c8amjSZc1lP2pxA6h4eokBXGTH3Hd6srS5iXuF1i_HzUA3-IBh6LHVTDUkuRJcMmd8Lq7NY__jCpbBDVw"],
//   //   "registration_ids": [
// 	// 	"czQc2QenqAQ:APA91bHs1PYScevGcKH-OaifY0b1eXfFf2g8k-ekyj5HfY3M9absHIpursXEsP301xqdj1l3Csi2RL-WKYi2Vqx9GakgNOaFgWq-x54KCspBl2tGe3X_LJLKhrLhNAOBJWUS-n0I5GcixQ4mTWY9ntqAnuB36CV2XQ",
// 	// 	"fEpejQtWtMc:APA91bEoxleBqswL1FeaiD2lS7F3HOG-fxjd3JicuA0_EJeKBWvhT4TFpmULRVtjrWttgD9jy44XVQISx3-VK2eYFtCq2Jxo9NHxMlGwqD3mwNjTrwjALI62on9YVyob8SwRlT7aPDBrsKX3z4KNk93K3bF-VONcjw",
// 	// 	"eCE5dzrtyuo:APA91bG5JSCixgj9vufiYReemCP8rGJQ36DXBufnDlt51o_OlxXm0oBqy7a-Z3e3Bl6MIni1l9AGjgXLrZXlevIIM6x1mxCqGNGjG_QZpPscvAFkKguuYlubBlk6BdrZcigDdQIU1jdw0EzxPGkpsIsSfxEQ9PuO6g",
// 	// 	"c-fObJY7jXI:APA91bHpPX3eWIlDBrE9xo-tAA3WRUOVmHcvO3s2M0O7JMjGkHB5Omidp4E8P9l_Wl-wm2_IMU_SSnvjixqGz4Te6tkjfdohizY92jV50b67KIdvhYHx3ZtViEGgjPKjfG4JtBVLtGNtA9_DK9rRxuRRAixFZ2T-hQ"
// 	// ],
//     "data":{
//       'title':"Testing",
//       'message':"Testing",
//       'color':'#309930',
//       'summary':"Testing",
//       'big_text':"Testing",
//       'nofitication_id':Math.round(new Date().getTime()/1000),
//       'big_allow_icon':'1',
//       'type':'0',
//       'url':"https://static.pexels.com/photos/4825/red-love-romantic-flowers.jpg"
//     }
//   }
// }, function (error, response, body) {
//   console.log(response.body);
// });

// Globalnotifications.find().sort({timestamp:1}).limit(3).select('title notification').exec(function(err,notifications){
//     console.log(notifications);
// });



// var tabula = require('tabula-js');
// var t = tabula('public/Test-2.PDF', {pages: "all"});
// t.extractCsv(function(err, data){
//   // console.log(data);
//   console.log(typeof data);
// // console.log(data.split(/(?:,|' ')+/) );
//
//   // var csvdata = data;
//   //                 fs.appendFile('public/'+'Test-2.CSV', csvdata,
//   //                 function(err){
//   //
//   //                 });
// });


// var tabula = require('tabula-js');
// var t = tabula('public/hdfc.PDF', {pages: "all"});
// t.extractCsv(function(err, data){
//   console.log(data);


  // console.log(data.toString().match(/[^\r\n]+/g));
  // var myString = data.toString();
// var splits = myString.split(',');

  // var dataToWrite= data;
  // fs.writeFile('public/'+'Test-2.CSV', dataToWrite, 'utf8', function (err) {
  //   if (err) {
  //     console.log('Some error occured - file either not saved or corrupted file saved.');
  //   } else{
  //     console.log('It\'s saved!');
  //   }
  // });
// });

// var tabula = require('tabula-js');
// var stream = tabula('public/Test-3.PDF').streamCsv();
// stream.pipe(process.stdout);

//  var tabula = require('tabula-js');
//  var stream = tabula('public/Test-3.PDF').streamCsv();
// stream
// .split('|')
// .doto(console.log)
// .done(() => console.log('ALL DONE!'));


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
