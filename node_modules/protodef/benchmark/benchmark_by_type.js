const testData=require("../test/dataTypes/prepareTests").testData;
const proto=require("../test/dataTypes/prepareTests").proto;
const Benchmark = require('benchmark');

testData.forEach(tests => {
  describe(tests.kind,function(){
    this.timeout(1000*60*10);

    tests.data.forEach(test => {
      describe(test.type,() => {

        it('reads',function() {
          const readSuite = new Benchmark.Suite;
          readSuite.add('read', function () {
              test.subtypes.forEach(subType => {
                subType.values.forEach((value) => {
                  proto.parsePacketBuffer(subType.type, value.buffer);
                });
              })
          })
          .on('cycle', function (event) {
            console.log(String(event.target));
          })
          .run({'async': false});
        });

        it('writes',function() {
          const writeSuite = new Benchmark.Suite;
          writeSuite.add('write', function () {
              test.subtypes.forEach(subType => {
                subType.values.forEach((value) => {
                  proto.createPacketBuffer(subType.type, value.value);
                });
              });
            })
            .on('cycle', function (event) {
              console.log(String(event.target));
            })
            .run({'async': false});
        });
      });
    });
  });
});

