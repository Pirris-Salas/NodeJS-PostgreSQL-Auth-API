const express = require('express');
const router = express.Router();
const { pool } = require('../dbConfig');
const bcrypt = require("bcrypt");

router.get('/', (req, res) => {

    res.json({
        message: 'Hola Luis'
    });
});

function validUser(user) {
    const validEmail = typeof user.email == 'string' &&
        user.email.trim() != '';

    const validPassword = typeof user.password == 'string' &&
        user.password.trim() != '' &&
        user.password.trim().length >= 5;

    return validEmail && validPassword;
}

router.post('/signup', async (req, res, next) => {

    if (validUser(req.body)) {

        const { name, email, password, phoneNumber } = req.body;

        let hashedPassword = await bcrypt.hash(password, 10);

        pool.query(
            `SELECT * FROM clients WHERE email = $1`,
            [email],
            (err, results) => {
                if (err) {
                    throw err;
                }

                if (results.rows.length > 0) {
                    const error = next(new Error(`Email ${email} already exists in the database`));

                } else {
                    // That means email doesn't exist in the database
                    pool.query(
                        `INSERT INTO clients (name, email, password, "phoneNumber")
                        VALUES($1, $2, $3, $4)
                        RETURNING id, password`, [name, email, hashedPassword, phoneNumber],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            
                            res.json({ message: `New user: ${name} entered successfully in the system` });
                        }
                    );
                }
            })


    } else {
        next(new Error('Invalid user'));
    }

});

router.post('/login', (req, res, next) => {
    if (validUser(req.body)) {
        const { email, password } = req.body;

        pool.query(
            `SELECT * FROM clients WHERE email = $1`,
            [email],
            (err, results) => {
                if (err) {
                    throw err;
                }

                if (results.rows.length > 0) {

                    const user = results.rows[0];
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) {
                            throw err;
                        }
                        if (isMatch) {
                            res.json({
                                message: `Welcome ${user.name}`,
                                user
                            });
                        } else {
                            res.json({ message: "Password is not correct. Try again" });
                        }
                    });
                } else {
                    next(new Error(`Email ${email} does not exists in the database. Please sign up`));
                }
            })
    } else {
        next(new Error('Invalid user'));
    }
});

module.exports = router;