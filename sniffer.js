var pcap = require('pcap'),
    tcp_tracker = new pcap.TCPTracker(),
    pcap_session = pcap.createSession('wlp4s0', "ip proto \\tcp");

pcap_session.on('packet', function (raw_packet) {
    var packet = pcap.decode.packet(raw_packet);
    tcp_tracker.track_packet(packet);
});


const Parser = require('protodef').Parser
const ProtoDef = require("protodef").ProtoDef;


const d2gsProto = require('./data/d2gs');

const d2gs = new ProtoDef();
//d2gs.addProtocol(d2gsProto,["toServer"]);
d2gs.addProtocol(d2gsProto,["toClient"]);

const {createSplitter, createFramer} = require('./splitter');

const {compress,decompress} = require('./compression');
const d2gsReader = require('./d2gsSpecialReader');

const protoToClient = new ProtoDef();
protoToClient.addTypes(d2gsReader);
protoToClient.addProtocol(d2gsProto,["toClient"]);

const toClientParser = new Parser(protoToClient, 'packet')
splitter = createSplitter();

splitter.on('data', data => {


    const uncompressedData = decompress(data);

    console.log("uncompressed d2gs received hex : "+uncompressedData.toString('hex'));
    toClientParser.write(uncompressedData);
});

toClientParser.on('data', ({data}) => {
    const {name,params} = data;
    console.info("received compressed packet", name, params);
})

// tracker emits sessions, and sessions emit data
tcp_tracker.on("session", function (session) {
    if(session.src_name.split(':')[1] == '4000' || session.dst_name.split(':')[1] == '4000')
        console.log("Start of TCP session between " + session.src_name + " and " + session.dst_name);
    session.on("data send", function (session, data) {
        if(session.src_name.split(':')[1] == '4000' || session.dst_name.split(':')[1] == '4000')
        {
            console.log('allo');
            try{

                //x = d2gs.parsePacketBuffer("packet", data).data
                splitter.write(data);
                //console.log(JSON.stringify(x, null, 2));
                /*
                if(x.name == 'D2GS_RUNTOLOCATION'){
                    setInterval(
                        function(){ session.inject(data) },
                        5000
                      );
                }*/


            }catch(error) {
                console.error("Error : " + error);
            }
        }
    });
    session.on("data recv", function (session, data) {
        //if(session.src_name.split(':')[1] == '4000' || session.dst_name.split(':')[1] == '4000')
        //    console.log("data received " + session.recv_bytes_payload + " + " + data.length + " bytes");
        });
    session.on("end", function (session) {
        if((session.src_name.split(':')[1] == '4000' || session.dst_name.split(':')[1] == '4000') ||
            (session.src_name.split(':')[1] == '6112' || session.dst_name.split(':')[1] == '6112'))
        {
            console.log("End of TCP session between " + session.src_name + " and " + session.dst_name);
            console.log("Set stats for session: ", session.session_stats());
        }
    });
});
