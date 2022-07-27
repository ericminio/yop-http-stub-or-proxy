const { expect } = require('chai');
const request = require('../app/request');
const { proxy } = require('../app/proxy');
const { Server } = require('../app/server');
const { extractPayload } = require('../app/extract-payload');

describe('proxy', () => {

    let service;

    beforeEach((done) => {
        service = new Server(proxy.service.port);
        service.start(done);
    });
    afterEach((done) => {
        service.stop(done);
    });
    after((done) =>{
        proxy.stop(done);
    });

    it('propagates request', (done) => {
        service.use((incoming, response) => {
            response.writeHead(200, { 'content-Type': 'text/plain' });
            response.end(`${incoming.method} ${incoming.url}`);
        });
        request({ 
            port: proxy.port, 
            method: 'POST',
            path:'/this/url' 
        })
            .then(answer => {
                expect(answer.statusCode).to.equal(200);
                expect(answer.headers['content-type']).to.equal('text/plain');
                expect(answer.payload).to.equal('POST /this/url');
                done();
            })
            .catch(done);
    });

    it('propagates payload', (done) => {
        service.use((incoming, response) => {
            extractPayload(incoming).then(payload => {          
                response.writeHead(200, { 'content-Type': 'text/plain' });
                response.end(payload);
            });
        });
        request({ 
            port: proxy.port, 
            method: 'POST',
            payload: 'this payload'
        })
            .then(answer => {
                expect(answer.statusCode).to.equal(200);
                expect(answer.headers['content-type']).to.equal('text/plain');
                expect(answer.payload).to.equal('this payload');
                done();
            })
            .catch(done);
    });
});