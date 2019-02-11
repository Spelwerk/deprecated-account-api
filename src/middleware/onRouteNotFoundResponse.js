const init = (app) => {
    app.use((req, res) => {
        res.status(404).send({ title: 'Route not found', details: 'The requested route could not be found.' });
    });
};

module.exports = { init };
