#!/usr/bin/env python

import socket
from struct import *


def read_string(buffer):
    s = ''
    i = 0
    while 1:
        c = buffer[i]
        if c == 0:
            return s, (i+1)
        s += chr(c)
        i+=1
    return '', 0

def read_headers(buffer):
    (ff,id,size)=unpack_from('<BBH', buffer)
    return (ff,id,size)

def read_sid_auth_info(buffer):
    (logon_type, server_token, udp_value, mpq_filetime) = unpack_from('<IIIQ', buffer)
    buffer=buffer[calcsize('<IIIQ'):]

    (mpq_filename, offset) = read_string(buffer)
    (valuestring, offset) = read_string(buffer[offset:])

    return logon_type, server_token, udp_value, mpq_filetime, mpq_filename, valuestring


def file_transfer_protocol_v1(buffer):
    (request_length,protocol_version,platform_id,product_id,banner_id,banner_file_extension,start_position_in_file,filetime_tmp,filename) \
    = unpack_from('<HHIIIIIQ', buffer)

    buffer=buffer[calcsize('<HHIIIIIQ'):]

    (filename, offset) = read_string(buffer[offset:])

    return request_length,protocol_version,platform_id,product_id,banner_id,banner_file_extension,start_position_in_file,filetime_tmp,filename



TCP_IP = '176.31.38.228'
TCP_PORT = 6112 # port d2
BUFFER_SIZE = 1024

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

s.connect((TCP_IP, TCP_PORT))


s.send(bytes.fromhex('01')) # Initialises a normal logon conversation

s.send(bytes.fromhex("FF 50 33 00 00 00 00 00 36 38 58 49 50 58"
					"32 44 0D 00 00 00 53 55 6E 65 C0 A8 01 23 C4 FF"
					"FF FF 0C 04 00 00 09 04 00 00 46 52 41 00 46 72"
					"61 6E 63 65 00")) # http://www.bnetdocs.org/?op=packet&pid=279 SID_AUTH_INFO

ping = s.recv(BUFFER_SIZE)

s.send(ping) #  Client opens connection #2 to the Battle.net server on port 6112


data = s.recv(BUFFER_SIZE)
# https://bnetdocs.org/packet/146


print(data[20:240])


(logon_type,server_token,udp_value,mpq_filetime,mpq_filename,valueString) = read_sid_auth_info(data)
# We need the mpq_filetime for next steps

read_headers(data)


print ("----------------------------")

s.send(bytes.fromhex('02')) # Initialises a BNFTP file download conversation


print ("----------------------------")


(request_length,protocol_version,platform_id,product_id,banner_id,banner_file_extension,start_position_in_file,filetime_tmp,filename) \
= file_transfer_protocol_v1("ff 50 65 00 00 00 00 00 96 66 4f 5a 0a 0c 00 00"
   "00 e4 88 77 e9 2b d2 01 c4 35 51 5a 2e 6d 70 71"
   "00 41 3d 33 38 34 35 35 38 31 36 33 34 20 42 3d"
   "38 38 30 38 32 33 35 38 30 20 43 3d 31 33 36 33"
   "39 33 37 31 30 33 20 34 20 41 3d 41 2d 53 20 42"
   "3d 42 2d 43 20 43 3d 43 2d 41 20 41 3d 41 2d 42"
   "00")



s.send(pack('<HHIIIIIQp',request_length,protocol_version,platform_id,product_id,banner_id,banner_file_extension,start_position_in_file,mpq_filename,filename))




data = s.recv(BUFFER_SIZE)

print("DATA : ",data)


s.close()
