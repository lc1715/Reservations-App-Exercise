/** Customer for Lunchly */

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       ORDER BY last_name, first_name`
    );
    return results.rows.map(c => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes 
        FROM customers WHERE id = $1`,
      [id]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  /**Search for a customer by first and last name */
  static async search(firstName, lastName) {

    const result = await db.query(`
    SELECT id
    FROM customers
    WHERE (first_name = $1 AND last_name = $2)`,
      [firstName, lastName])

    if (result.rows[0] === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return result.rows[0].id
  }

  /**Get the first 10 customers with most reservations */
  static async bestCustomers() {

    const result = await db.query(`
    SELECT id, customer_id
    FROM reservations
    ORDER BY customer_id
    `)

    let arr = []
    let newObj = {}

    for (let obj of result.rows) {
      if (Object.keys(newObj).length === 0) {
        newObj.customer_id = obj.customer_id
        newObj.value = 1
      } else if (newObj.customer_id === obj.customer_id) {
        newObj.value += 1
      } else {
        arr.push(newObj)
        newObj = {}
        newObj.customer_id = obj.customer_id
        newObj.value = 1
      }
    }

    let newArr = []

    for (let obj of arr) {
      newArr.push(obj.value)
    }

    newArr.sort(function (a, b) {
      return a - b
    })

    let reversedValuesArr = newArr.reverse()

    let bestCs = []
    let count = 0

    while (count < 10) {
      for (let obj of arr) {

        if (obj.value === reversedValuesArr[0]) {
          bestCs.push(obj.customer_id)
          delete obj.value;
          reversedValuesArr.shift()
          break
        }

      }
      count += 1
    }

    let cust1 = bestCs[0]
    let cust2 = bestCs[1]
    let cust3 = bestCs[2]
    let cust4 = bestCs[3]
    let cust5 = bestCs[4]
    let cust6 = bestCs[5]
    let cust7 = bestCs[6]
    let cust8 = bestCs[7]
    let cust9 = bestCs[8]
    let cust10 = bestCs[9]

    const customers = await db.query(`
    SELECT id, first_name, last_name
    FROM customers
    WHERE id IN ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ORDER BY last_name`,
      [cust1, cust2, cust3, cust4, cust5, cust6, cust7, cust8, cust9, cust10])

    console.log('customers&&&&', customers.rows)
    return customers.rows
  }


  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {

    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
             WHERE id=$5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }

  /**
   * Get full name of customer
   */
  async fullName(id) {
    const result = await db.query(`
    SELECT first_name, last_name
    FROM customers
    WHERE id = $1`,
      [id])

    const fullName = result.rows[0].first_name + ' ' + result.rows[0].last_name

    return fullName
  }
}

module.exports = Customer;
