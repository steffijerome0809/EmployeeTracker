const inquirer = require("inquirer");
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
        case "update employee manager":
          upd_emp_manager();
          break;
        case "remove employee":
          remove_emp();
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
      console.log(answers);
      connection.query(
        "INSERT INTO employee SET ?",
        {
          first_name: answers.first_name,
          last_name: answers.last_name,
          role_id: null,
          manager_id: null,
        },
        function (err, result) {
          if (err) {
            throw err;
          }
          console.log(first_name + last_name, "was added to the database");
          console.table(result);
        }
      );
      startQue();
    });
}

function view_emp_by_dep() {
  //   select e.first_name as firstname ,e.last_name as lastname from employee e ,role r join department d on r.department_id=d.id where d.name="Sales";
  inquirer
    .prompt({
      type: "list",
      name: "departmentname",
      message: "Which department employees do you want to view ?",
      choices: ["Management", "Legal", "Sales", "Engineering", "Finance"],
    })
    .then((answers) => {
      var query =
        "select em.first_name as firstname ,em.last_name as lastname from employee e join employee em on e.empid=em.manager_id";
      query +=
        " join role r on r.roleid=em.role_id join department d on d.id=r.department_id where d.name=?";

      connection.query(query, [answers.departmentname], (err, result) => {
        console.log(result.length + "matches found");
        //console.log(result);
        console.table(result);
      });
      startQue();
    });
}

function view_emp_by_manager() {
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

        console.table(result);
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
    //;console.log(result);

    console.table(result);
  });
  startQue();
}

function upd_emp_role() {
  let allemp = [];
  let role = [
    "Sales Lead",
    "Sales person",
    "Lead Engineer",
    "Software Engineer",
    "Account Manager",
    "Accountant",
    "Legal Team Lead",
    "Lawyer",
  ];
  connection.query("SELECT * FROM employee", function (err, answer) {
    // console.log(answer);
    for (let i = 0; i < answer.length; i++) {
      let employeeString =
        answer[i].empid +
        " " +
        answer[i].first_name +
        " " +
        answer[i].last_name;
      allemp.push(employeeString);
    }

    // console.log(allemp)

    inquirer
      .prompt([
        {
          type: "list",
          name: "updateEmpRole",
          message: "select employee to update role",
          choices: allemp,
        },
        {
          type: "list",
          message: "select new role",
          choices: role,
          name: "newrole",
        },
      ])
      .then(function (answers) {
        console.log("about to update", answers);
        const idToUpdate = {};
        idToUpdate.employeeId = parseInt(answers.updateEmpRole.split(" ")[0]);
        // console.log(idToUpdate);

        switch (answers.newrole) {
          case "Sales Lead":
            idToUpdate.role_id = 1;
            break;
          case "Sales person":
            idToUpdate.role_id = 2;
            break;
          case "Lawyer":
            idToUpdate.role_id = 3;
            break;
          case "Lead Engineer":
            idToUpdate.role_id = 4;
            break;
          case "Software Engineer":
            idToUpdate.role_id = 5;
            break;
          case "Account Manager":
            idToUpdate.role_id = 6;
            break;
          case "Accountant":
            idToUpdate.role_id = 7;
            break;
          case "Legal Team Lead":
            idToUpdate.role_id = 8;
            break;
        }
        console.log(answers.newrole);
        console.log(idToUpdate.role_id, "+", idToUpdate.employeeId);
        connection.query(
          "UPDATE employee SET role_id = ? WHERE empid = ?",
          [idToUpdate.role_id, idToUpdate.employeeId],
          function (err, result) {
            // if (err) throw err;
            console.table(result);
          }
        );
        startQue();
      });
  });
}

function upd_emp_manager() {
  let allemp = [];
  connection.query("SELECT * FROM employee", function (err, answer) {
    for (let i = 0; i < answer.length; i++) {
      let employeeString =
        answer[i].empid +
        " " +
        answer[i].first_name +
        " " +
        answer[i].last_name;
      allemp.push(employeeString);
    }
    // console.log(allemp)

    inquirer
      .prompt([
        {
          type: "list",
          name: "updateempManager",
          message: "select employee to update manager",
          choices: allemp,
        },
        {
          type: "list",
          message: "select new manager",
          choices: allemp,
          name: "newManager",
        },
      ])
      .then(function (answers) {
        console.log("about to update", answers);
        const idToUpdate = {};
        idToUpdate.employeeId = parseInt(
          answers.updateempManager.split(" ")[0]
        );
        //console.log(idToUpdate.employeeId);

        idToUpdate.managerId = parseInt(answers.newManager.split(" ")[0]);

        //console.log(idToUpdate.managerId);

        connection.query(
          "UPDATE employee SET manager_id= ? WHERE empid = ?",
          [idToUpdate.managerId, idToUpdate.employeeId],
          function (err, result) {
            if (err) throw err;
            console.table(result);
          }
        );
        startQue();
      });
  });
}

function remove_emp() {
  let allemp = [];

  connection.query("SELECT * FROM employee", function (err, answer) {
    for (let i = 0; i < answer.length; i++) {
      let employeeString =
        answer[i].empid +
        " " +
        answer[i].first_name +
        " " +
        answer[i].last_name;
      allemp.push(employeeString);
    }
    // console.log(allemp)

    inquirer
      .prompt([
        {
          type: "list",
          name: "removeEmp",
          message: "select employee that you want to remove ",
          choices: allemp,
        },
      ])
      .then(function (answers) {
        console.log("about to delete", answers);
        const idToRemove = {};
        idToRemove.employeeId = parseInt(answers.removeEmp.split(" ")[0]);
        console.log(idToRemove.employeeId);

        connection.query(
          "DELETE FROM employee  WHERE empid = ?",
          [idToRemove.employeeId],
          function (err, result) {
            if (err) throw err;
            console.table(result);
          }
        );
        startQue();
      });
  });
}

// start function call
startQue();
