const inquirer = require("inquirer");
const consoleTable = require("console.table");
const connection = require("./db/db.js");
const mysql = require("mysql");

const startQue = function () {
  inquirer
    .prompt({
      type: "list",
      name: "questions",
      message: "What would you like to do ?",
      choices: [
        "add department",
        "add role",
        "add employee",
        "view all employees by department",
        "view all employees by manager",
        "view all employees",
        "update employee role",
        "update employee manager",
        "remove employee",
      ],
    })
    .then((answers) => {
      console.log("check +", answers);
      // start of switch statements

      switch (answers.questions) {
        case "add department":
          addDepartment();
          break;
        case "add role":
          addRole();
          break;
        case "add employee":
          addEmployee();
          break;
        case "view all employees":
          view_all_emp();
          break;
        case "view all employees by department":
          view_emp_by_dep();
          break;
        case "view all employees by manager":
          view_emp_by_manager();
          break;
        case "update employee role":
          upd_emp_role();
          break;
      }
    });
};
// Adding department

function addDepartment() {
  inquirer
    .prompt({
      type: "input",
      name: "depname",
      message: "Enter Department Name",
    })
    .then((answers) => {
      connection.query(
        "insert into department set ?",
        {
          name: answers.depname,
        },
        function (err, answers) {
          if (err) {
            throw err;
          }
          console.table(answers);
        }
      );
      startQue();
    });
}

function addRole() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "title",
        message: "Enter employee title",
      },
      {
        type: "input",
        name: "salary",
        message: "Enter employee salary",
      },
      {
        type: "input",
        name: "department_id",
        message: "Enter employee department id",
      },
    ])
    .then((answers) => {
      connection.query(
        "insert into role set ?",
        {
          title: answers.title,
          salary: answers.salary,
          department_id: answers.department_id,
        },
        function (err, answers) {
          if (err) {
            throw err;
          }
          console.table(answers);
        }
      );
      startQue();
    });
}

function addEmployee() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "first_name",
        message: "Enter employee first name",
      },
      {
        type: "input",
        name: "last_name",
        message: "Enter employee last name",
      },
    ])
    .then((answers) => {
      connection.query(
        "INSERT INTO employee (first_name, last_name, role_id,manager_id) VALUES ?",
        {
          first_name: answers.first_name,
          last_name: answers.last_name,
          role_id: null,
          manager_id: null,
        },
        function (err, answers) {
          if (err) {
            throw err;
          }
          console.log(first_name, last_name, "was added to the database");
          console.table(answers);
        }
      );
      startQue();
    });
}

function view_emp_by_dep() {
  //   select e.first_name as firstname ,e.last_name as lastname from employee e ,role r join department d on r.department_id=d.id where d.name="Sales";
  inquirer
    .prompt({
      type: "input",
      name: "departmentname",
      message: "Which department employees do you want to view ?",
    })
    .then((answers) => {
      var query =
        "select e.first_name as firstname ,e.last_name as lastname from employee e ,role r join department d on r.department_id=d.id where d.name=?";
      connection.query(query, [answers.departmentname], (err, result) => {
        console.log(result.length + "matches found");
        //console.log(result);
        console.table(answers);
      });
      startQue();
    });
}

function view_emp_by_manager() {
  //  select em.first_name as firstname ,em.last_name as lastname,concat(e.first_name," ",e.last_name) as manager from employee e join employee em on e.empid=em.manager_id;
  inquirer
    .prompt({
      type: "input",
      name: "managername",
      message: "Name the manager whose employees you want to view ?",
    })
    .then((answers) => {
      var query =
        "select em.first_name as firstname ,em.last_name as lastname, CONCAT(e.first_name,' ',e.last_name) as manager from employee e join employee em on e.empid=em.manager_id where e.first_name=?";
      connection.query(query, [answers.managername], (err, result) => {
        console.log(result.length + "matches found");
        //console.log(result);
        console.table(answers);
      });
      startQue();
    });
}

function view_all_emp() {
  var query =
    "select em.first_name as firstname ,em.last_name as lastname,r.title,r.salary,d.name,";
  query +=
    'concat(e.first_name," ",e.last_name) as manager from employee e join employee em on e.empid=em.manager_id';
  query +=
    " join role r on r.roleid=em.role_id join department d on d.id=r.department_id";
  //console.log(query);
  connection.query(query, (err, result) => {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.log(result);

    //console.table()
  });
  startQue();
}

function upd_emp_role() {
    let emp = [];
    connection.query("SELECT * FROM employee", function(err, answer) {
      // console.log(answer);
      for (let i = 0; i < answer.length; i++) {
        let emplist =
          answer[i].empid + " " + answer[i].first_name + " " + answer[i].last_name;
        emp.push(emplist);
      }
      // console.log(allemp)
  
      inquirer
        .prompt([
          {
            type: "list",
            name: "updateEmpRole",
            message: "select employee to update role",
            choices: allemp
          },
          {
            type: "list",
            message: "select new role",
            choices: ["manager", "employee"],
            name: "newrole"
          }
        ])
        .then(function(answer) {
          console.log("about to update", answer);
          const idToUpdate = {};
          idToUpdate.employeeId = parseInt(answer.updateEmpRole.split(" ")[0]);
          if (answer.newrole === "manager") {
            idToUpdate.role_id = 1;
          } else if (answer.newrole === "employee") {
            idToUpdate.role_id = 2;
          }
          connection.query(
            "UPDATE employee SET role_id = ? WHERE id = ?",
            [idToUpdate.role_id, idToUpdate.employeeId],
            function(err, data) {
              askQ();
            }
          );
        });
    });
  }
// start function call
startQue();
