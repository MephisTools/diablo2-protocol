var pcap = require('pcap'),
    tcp_tracker = new pcap.TCPTracker(),
    pcap_session = pcap.createSession('wlp4s0', "ip proto \\tcp");

pcap_session.on('packet', function (raw_packet) {
    var packet = pcap.decode.packet(raw_packet);
    tcp_tracker.track_packet(packet);
});


const ProtoDef = require("protodef").ProtoDef;


const bnftpProto = require('./data/bnftp');

const bnftp = new ProtoDef();
bnftp.addProtocol(bnftpProto,["toServer"]);

const d2gsProto = require('./data/d2gs');

const d2gs = new ProtoDef();
d2gs.addProtocol(d2gsProto,["toServer"]);

const mcpProto = require('./data/mcp');

const mcp = new ProtoDef();
mcp.addProtocol(mcpProto,["toServer"]);


// tracker emits sessions, and sessions emit data
tcp_tracker.on("session", function (session) {
    if(session.src_name.split(':')[1] == '4000' || session.dst_name.split(':')[1] == '4000')
        console.log("Start of TCP session between " + session.src_name + " and " + session.dst_name);
    session.on("data send", function (session, data) {
        if(session.src_name.split(':')[1] == '4000' || session.dst_name.split(':')[1] == '4000')
        {
            console.log("data send " + session.send_bytes_payload + " + " + data.length + " bytes");


            console.log(JSON.stringify(d2gs.parsePacketBuffer("packet", data).data, null, 2));
        }
    });
    session.on("data recv", function (session, data) {
        //if(session.src_name.split(':')[1] == '4000' || session.dst_name.split(':')[1] == '4000')
        //    console.log("data received " + session.recv_bytes_payload + " + " + data.length + " bytes");
        });
    session.on("end", function (session) {
        if(session.src_name.split(':')[1] == '4000' || session.dst_name.split(':')[1] == '4000')
        {
            console.log("End of TCP session between " + session.src_name + " and " + session.dst_name);
            console.log("Set stats for session: ", session.session_stats());
        }
    });
});
