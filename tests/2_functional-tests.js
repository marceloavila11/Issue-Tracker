const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  let testId;

  test('Create an issue with every field', function (done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Test Issue',
        issue_text: 'This is a test issue',
        created_by: 'Tester',
        assigned_to: 'Test Assignee',
        status_text: 'In Progress'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Test Issue');
        testId = res.body._id; // Save for future tests
        done();
      });
  });

  test('Create an issue with only required fields', function (done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Test Issue 2',
        issue_text: 'This is another test issue',
        created_by: 'Tester'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Test Issue 2');
        done();
      });
  });

  test('Create an issue with missing required fields', function (done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_text: 'Missing title',
        created_by: 'Tester'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  test('View issues on a project', function (done) {
    chai.request(server)
      .get('/api/issues/test')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test('View issues on a project with one filter', function (done) {
    chai.request(server)
      .get('/api/issues/test')
      .query({ open: true })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test('View issues on a project with multiple filters', function (done) {
    chai.request(server)
      .get('/api/issues/test')
      .query({ open: true, created_by: 'Tester' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test('Update one field on an issue', function (done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: testId, issue_text: 'Updated text' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        done();
      });
  });

  test('Update multiple fields on an issue', function (done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: testId, issue_title: 'Updated Title', issue_text: 'Updated text' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        done();
      });
  });

  test('Update an issue with missing _id', function (done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ issue_text: 'No ID' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  test('Update an issue with no fields to update', function (done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: testId })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
      });
  });

  test('Update an issue with an invalid _id', function (done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: 'invalidId', issue_text: 'Invalid ID test' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });

  test('Delete an issue', function (done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({ _id: testId })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully deleted');
        done();
      });
  });

  test('Delete an issue with an invalid _id', function (done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({ _id: 'invalidId' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not delete');
        done();
      });
  });

  test('Delete an issue with missing _id', function (done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
});
