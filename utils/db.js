const { Client } = require("pg");

const getDatabase = async () => 
{
  var pgClient = new Client(process.env.DATABASE_URL);
  await pgClient.connect();
  return pgClient;
};
// var pgClient = new Client(process.env.DATABASE_URL);
// pgClient.connect((err) => {
//   if (err)
//   {
//     console.log(err);
//   }
//   else 
//   {
//     console.log("Connected to database");

//     pgClient.query(`SELECT EXISTS (
//       SELECT FROM information_schema.tables 
//       WHERE  table_schema = 'schema_name'
//       AND    table_name   = 'table_name'
//     );`).then((val) => {
//       console.log(val);
//     }, (reason) => {
//       console.log ("Rejected")
//       console.log(reason);
//     });
//   }
// })

module.exports = { getDatabase }