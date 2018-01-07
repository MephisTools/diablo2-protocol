const testData=require("../test/dataTypes/prepareTests").testData;
const proto=require("../test/dataTypes/prepareTests").proto;
const Benchmark = require('benchmark');

it('read/write',function() {
  this.timeout(1000*60*10);
  const suite = new Benchmark.Suite;
  suite.add('read/write', function () {
      testData.forEach(tests => {
        tests.data.forEach(test => {
          test.subtypes.forEach(subType => {
            subType.values.forEach((value) => {
              proto.parsePacketBuffer(subType.type, value.buffer);
              proto.createPacketBuffer(subType.type, value.value);
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

