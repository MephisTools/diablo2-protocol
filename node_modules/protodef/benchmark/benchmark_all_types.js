const testData=require("../test/dataTypes/prepareTests").testData;
const proto=require("../test/dataTypes/prepareTests").proto;
const Benchmark = require('benchmark');

it('reads',function() {
  this.timeout(1000*60*10);
  const readSuite = new Benchmark.Suite;
  readSuite.add('read', function () {
    testData.forEach(tests => {
        tests.data.forEach(test => {
          test.subtypes.forEach(subType => {
            subType.values.forEach((value) => {
              proto.parsePacketBuffer(subType.type, value.buffer);
            });
          })
        });
      });
    })
    .on('cycle', function (event) {
      console.log(String(event.target));
    })
    .run({'async': false});
});

it('writes',function() {
  this.timeout(1000*60*10);
  const writeSuite = new Benchmark.Suite;
  writeSuite.add('write', function () {
    testData.forEach(tests => {
        tests.data.forEach(test => {
          test.subtypes.forEach(subType => {
            subType.values.forEach((value) => {
              proto.createPacketBuffer(subType.type, value.value);
            });
          });
        });
      });
    })
    .on('cycle', function (event) {
      console.log(String(event.target));
    })
    .run({'async': false});
});

