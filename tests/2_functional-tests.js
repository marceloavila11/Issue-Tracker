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
        assert.equal(res.body.issue_text, 'This is a test issue');
        assert.equal(res.body.created_by, 'Tester');
        assert.equal(res.body.assigned_to, 'Test Assignee');
        assert.equal(res.body.status_text, 'In Progress');
        assert.isTrue(res.body.open);
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
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
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
});
