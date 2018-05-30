// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
const config = require('./config'),
  express = require('express'),
  compress = require('compression'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  session = require('express-session'),
  flash = require('connect-flash'),
  passport = require('passport'),
  logger = require('morgan'),
  path = require('path'),
  cookieParser = require('cookie-parser'),
  db = require('./sequelize'),
  Sequelize = require('sequelize'),
  cors = require('cors'),
  nodemailer = require('nodemailer'),
  SequelizeStore = require('connect-session-sequelize')(session.Store);

//  Main Site Routes
const api_results = require('../app/routes/api_results');
const api_DB_writer = require('../app/routes/api_DB_writer');
const api_file_data = require('../app/routes/api_file_data');
const api_tests = require('../app/routes/api_tests');
const api_export = require('../app/routes/api_export');
const language = require('../app/routes/language');
const main = require('../app/routes/main');
const output = require('../app/routes/output');
const api_dashboard = require('../app/routes/api_dashboard');
const api_dashboardTWO = require('../app/routes/api_dashboardTWO');
const authenticate = require('../app/routes/authentication');
const api_testRunner = require('../app/routes/api_testRunner');
const api_emailer = require('../app/routes/api_emailer');
const api_documents = require('../app/routes/api_documents');

// const api_login = require('../app/routes/api_login');
const test_case_editor = require('../app/routes/test_case_editor');

// Angular App Routes
const angular_results = require('../app/routes/angular_results')

// Define the Express configuration method
module.exports = function() {

  // Create a new Express application instance
  var app = express();

  // Enable cors requests
  // https://github.com/expressjs/cors
  app.use(cors());

  // Use the 'NDOE_ENV' variable to activate the 'morgan' logger or 'compress' middleware

  if (process.env.NODE_ENV === 'development') {
    app.use(logger('dev'));
  } else if (process.env.NODE_ENV === 'production') {
    app.use(compress());
  }

  // Use the 'body-parser' and 'method-override' middleware functions
  app.use(bodyParser.urlencoded({
    extended: false
  }));

  app.use(bodyParser.json());

  // ## -- Angular Routing for future implementation 
  // ## -- Need to reconfigure package.json as well.
  // 
  // #################################################################################
  // #
  //app.use('/', express.static(path.join(__dirname, '../dist')));
  //app.use('/angular', express.static(path.join(__dirname, '../dist')));
  // #
  // # <-- Angular Rest Routes Begin Here -->
  // #
  //app.get('/angular-results', angular_results.all)
  // #
  // # <-- Angular Rest Routes End Here --> 
  // #
  // #################################################################################

  // #####################################
  //#
  //#
  //# Authentication
  //#
  //#

  //######################################

  // Configure the 'session' middleware
  // **** Persistent Sessions ******
  // ***  This will be important when using socket.io *** 

  app.use(cookieParser('buffalo-bill-1999'));

  var sessionConnect = new Sequelize(
    "test",
    "flukeqa",
    "H0lidayApples", {
      "dialect": "mysql",
      "storage": "./session.mysql",
      "logging": false
    });

  let dbSessionStore = new SequelizeStore({
    db: sessionConnect
  })

  app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: "Sasquetooga",
    store: new SequelizeStore({
      db: sessionConnect
    }),
  }));

  dbSessionStore.sync();

  // Configure Flash Messages 
  app.use(flash());

  app.use(function(req, res, next) {
    res.locals.message = req.flash('message');
    next();
  });

  // Configure the Passport middleware
  app.use(passport.initialize());

  // Persistent login session.
  app.use(passport.session());

  //###########################################

  // Landing Page
  app.get('/', main.getHome);

  app.get('/signup', authenticate.signup);

  //app.get('/signup', isLoggedIn, authenticate.signup);

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/dashboard',
    failureRedirect: '/signup'
  }));

  app.get('/login', authenticate.login);

  app.post('/login', passport.authenticate('local-signin', {
    successRedirect: '/dashboard',
    failureRedirect: '/login'
  }));

  app.get('/logout', authenticate.logout);

  // Send email for reset password link
  app.get('/emailer', authenticate.emailer);
  app.post('/emailer', api_emailer.pwd_emailer);

  // Reset password
  app.get('/reset_password', authenticate.reset_password);
  app.post('/reset_password', passport.authenticate('local-reset-password', {
    successRedirect: '/login',
    failureRedirect: 'http://live-igcommerce.pantheonsite.io/en-us/'
  }));


  // Temporary page settup for login
  //app.get('/login', api_login.getLogin);

  // TODO:: Fundamentals (THIS IS HYPOTHETICAL, BUT IT MAY CONSIST OF A COUPLE OF GENERAL QUERIES TO SHOW FUNDAMENTAL TESTS.)
  // THOSE TESTS ARE THINGS LIKE url 404, vs 200, and whether or not there is content on the page.

  //app.get('/results/fundamentals/page') 

  // Dashboard Pages
  app.get('/dashboard', isLoggedIn, api_dashboard.getOverview);
  app.get('/dashboardTWO', api_dashboardTWO.render);
  app.get('/dashboard/locale/:locale', isLoggedIn, api_dashboard.getResultMetaByLocale);
  app.get('/dashboard/query/:custom', isLoggedIn, api_dashboard.getResultMetaByCustom);

  // Dashboard page - delete Test Results by Id
  app.get('/deleteTestResults', isLoggedIn, api_dashboard.deleteTestResults);
  
  // Results Pages 
  app.get('/results/locale/:locale', isLoggedIn, api_results.getResultByLanguage);
  app.get('/results/locale/:locale/testresult/:testresult', isLoggedIn, api_results.getResultByLangAndTestResult);
  app.get('/addNotesToResultsPage', isLoggedIn, api_DB_writer.addNotesToResultTable_DB);
  app.get('/addOwnerToResultsPage', isLoggedIn, api_DB_writer.addOwnerToResultTable_DB);


  // TODO:: 
  //app.get('/results/feature/:template', api_results.getResultByLanguage);
  //app.get('/results/feature/:template/testresult/:testresult', api_results.getResultByLangAndTestResult);

  // feature - query - ok
  // feature - query - testresult - ok

  app.get('/results/feature/:template/query/:custom', isLoggedIn, api_results.getResultByTemplateCustom);

  app.get('/results/feature/:template/query/:custom/testresult/:testresult', isLoggedIn, api_results.getResultByTemplateCustomAndTestResult);

  // locale - feature - ok
  // locale - feature - testresult

  app.get('/results/feature/:template/locale/:locale', isLoggedIn, api_results.getResultByIdAndLanguage);

  app.get('/results/feature/:template/locale/:locale/testresult/:testresult/', isLoggedIn, api_results.getResultByLangFeatureAndTestResult);

  // Feature - locale - query
  // Feature - template - query - test result 

  app.get('/results/feature/:template/locale/:locale/query/:custom', isLoggedIn, api_results.getResultByIdLanguageCustom);

  app.get('/results/feature/:template/locale/:locale/query/:custom/testresult/:testresult/', api_results.getResultByIdLanguageCustomTestResult);

  // Export Tool
  app.get('/export-tool', isLoggedIn, api_export.getExport);
  app.get('/export', isLoggedIn, api_export.getExportFromResults, api_export.export_to_excel);
  app.post('/getTemplatesAndLangFromTestPass', isLoggedIn, api_export.getLangsAndTemps);

  // Test Information Routes
  app.get('/files', isLoggedIn, api_file_data.getAvailableTests);

  // Test Runner Routes
  //app.get('/test-runner', isLoggedIn, api_file_data.getAvailableTests, api_file_data.getProcesses);
  app.get('/test-runner/:script', isLoggedIn, api_file_data.runTest);
  app.get('/test-runner/:script/:locale', isLoggedIn, api_file_data.runTest);
  app.get('/test-runner', isLoggedIn, api_testRunner.getOverview);

  app.post('/getTestCases', isLoggedIn, api_testRunner.getTestCases)

  app.get('/test-status', isLoggedIn, api_tests.getTestStatus);
  app.get('/getprocesses', isLoggedIn, api_tests.getProcesses);
  app.get('/startprocess', isLoggedIn, api_tests.startProcess);

  app.post('/run-test', isLoggedIn, api_tests.postTest, api_tests.startProcess);
  app.get('/stop-test', isLoggedIn, api_tests.stopTest);

  app.post('/post-gherkin', isLoggedIn, test_case_editor.postGherkin);
  app.post('/new-gherkin', isLoggedIn, test_case_editor.newGherkin);
  app.post('/clean-gherkin', isLoggedIn, api_DB_writer.cleanGherkin_DB);
  //app.post('/clean-gherkin', isLoggedIn, test_case_editor.cleanGherkin_DB)

  // Document page for ReadMe file and references
  app.get('/docs', isLoggedIn, api_documents.showDocs);

  // Edit Test Cases
  app.get('/test-case-editor', isLoggedIn, test_case_editor.editTestCases);

  // Delete Test Cases
  app.post('/delete-test-case', isLoggedIn, test_case_editor.deleteTestCases);

  // Language Detection Route
  app.post('/detect', language.postLanguage);

  //load passport strategies
  require('./passport.js')(passport, db.user);

  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
      return next();

    res.redirect('/login');
  }

  // Configure static file serving
  app.use(express.static('public'));
  app.use(express.static('node_modules'));

  app.use(methodOverride());

  // Set the application view engine and 'views' folder
  app.set('views', './app/views');
  app.set('view engine', 'ejs');

  // Configure the flash messages middleware


  //
  // Error Handling -> 404, 500, & All Errors
  // 

  app.use(function(req, res, next) {
    var err = new Error('404 PAGE NOT FOUND');
    err.status = 404;
    next(err);
  });
  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ?
      err : {};
    // render the error page
    res.status(err.status || 500);

    console.log('\x1b[31m', err);

    res.render('error', {
      title: 'YOU\'VE REACHED THE ERROR PAGE',
      error: err.message
    });
  });

  // Load the routing files

  //require('express-load-routes')(app, '../app/routes');

  //require('../app/routes/index.server.routes.js')(app);
  //require('../app/routes/dashboard.server.routes.js')(app);
  //require('../app/routes/results.server.routes.js')(app);

  // Return the Express application instance
  return app;
};
