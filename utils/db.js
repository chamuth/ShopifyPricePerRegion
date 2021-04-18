const { Client } = require("pg");

const getDatabase = async () => 
{
  var pgClient = new Client("postgres://prrsbxxhpdgjwi:b470a762490ee281efa562d75def798a019c3b4dac411bb2737f2eeb4cc77965@ec2-52-23-45-36.compute-1.amazonaws.com:5432/d3nb7unse3sq4u");
  pgClient.ssl = true;
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