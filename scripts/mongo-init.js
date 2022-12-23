// this content is executed by mongoosh, so it has access db global var
const dbUser = process.env['APP_USER'] || 'app_user';
var dbPwd = process.env['APP_PWD'] || 'app_user()';
var dbName = process.env['DB_NAME'] || 'devDb';

db = db.getSiblingDB(dbName);

db.createUser({
  user: dbUser,
  pwd: dbPwd,
  roles: [{ role: 'dbOwner', db: dbName }],
});
