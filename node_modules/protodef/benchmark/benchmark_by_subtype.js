const testData=require("../test/dataTypes/prepareTests").testData;
const proto=require("../test/dataTypes/prepareTests").proto;
const Benchmark = require('benchmark');

function testType(type,values)
{
  it('reads',function() {
    const readSuite = new Benchmark.Suite;
    readSuite.add('read', function () {
        values.forEach((value) => {
          proto.parsePacketBuffer(type, value.buffer);
        });
      })
      .on('cycle', function (event) {
        console.log(String(event.target));
      })
      .run({'async': false});
  });

  it('writes',function() {
    const writeSuite = new Benchmark.Suite;
    writeSuite.add('write', function () {
        values.forEach((value) => {
          proto.createPacketBuffer(type, value.value);
        });
      })
      .on('cycle', function (event) {
        console.log(String(event.target));
      })
      .run({'async': false});
  });
}

testData.forEach(tests => {
  describe(tests.kind,function(){
    this.timeout(1000*60*10);

    tests.data.forEach(test => {
      describe(test.type,() => {
        test.subtypes.forEach((subtype) => {
          if(subtype.description) describe(subtype.description,() => {
            testType(subtype.type,subtype.values);
          });
          else
            testType(subtype.type,subtype.values);
        });
      });
    });
  });
});

