const adminCredentials = {
    username: 'admin',
    password: 'password123' // Change this to a more secure password in production
};

function authenticate(req, res, next) {
    const { username, password } = req.body;

    if (username === adminCredentials.username && password === adminCredentials.password) {
        req.isAuthenticated = true;
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports = authenticate;