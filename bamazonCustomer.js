var mysql = require("mysql");

var inquirer = require("inquirer");

var table = require("console.table");

var itemToBuy = "";

var numberToBuy = "";

var price = 0;

var connection = mysql.createConnection({
	host: "127.0.0.1",
	port: 8889,

	// my username
	user: "root",
	// my password
	password: "root", 
	// my database name
	database: "bamazon"

}); 

connection.connect(function(err){
	
	if (err) throw err;

});


function runBam () {
	connection.query("SELECT * FROM products", function(err, res) {
 		 if (err) throw err;
 		console.table(res);
 		questionOne();
	});
		
};



function questionOne () {
inquirer.prompt([
		{name: "item_to_buy",	
			type: "input",
			message: "what item would you like to purchase (enter id#)"},
		
		{name: "number_to_buy",	
			type: "input",
			message: "how many would you like to purchase?", 
		
		}
		]).then(function(answer){
			itemToBuy = (answer.item_to_buy);
			console.log("item to buy: " + itemToBuy);
			numberToBuy = parseInt(answer.number_to_buy);
			console.log("number to buy: " + numberToBuy);
			executeOrder();
		
	});

};

function buyAgain () {
	inquirer.prompt([
		{name: "buy_again",	
			type: "list",
			message: "would you like to buy anything else?",
			choices: ["yes", "no"]
		}]).then(function(answer){
			switch(answer.buy_again){
			case "yes" :
				runBam();
				break;
			case "no" :
				console.log("Thanks for shopping BAMAZON!");
				exit();
				break;
			default: 
				console.log("did not have argument");
				exit();
			};
		
	});
}

function exit () {
	connection.end();

};

function executeOrder () {
	connection.query("SELECT stock_quantity FROM products WHERE ?", {
		item_id: itemToBuy
	}, function (err, res) {
		var numberInStock = (res[0].stock_quantity);
		console.log("number in stock: " + numberInStock);
		if (numberInStock < numberToBuy){
			console.log("Insufficient Quantity!");
			buyAgain();
		}else {
			connection.query("UPDATE products SET ? WHERE ?", [{
				stock_quantity: (numberInStock - numberToBuy)
			}, {
				item_id: itemToBuy
			}], function(err, res) {});

			connection.query("SELECT price FROM products WHERE ?", {
				item_id: itemToBuy
			}, function (err,res) {
				price = (res[0].price);
				console.log("Total cost: " + (price*numberToBuy));
				buyAgain();
			});

		}
	});
};


runBam();


