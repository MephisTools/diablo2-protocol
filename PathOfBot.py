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

"""
unpack('<HHIIIIIQp',bytes.fromhex("ff 50 65 00 00 00 00 00 96 66 4f 5a 0a 0c 00 00"
   "00 e4 88 77 e9 2b d2 01 c4 35 51 5a 2e 6d 70 71"
   "00 41 3d 33 38 34 35 35 38 31 36 33 34 20 42 3d"
   "38 38 30 38 32 33 35 38 30 20 43 3d 31 33 36 33"
   "39 33 37 31 30 33 20 34 20 41 3d 41 2d 53 20 42"
   "3d 42 2d 43 20 43 3d 43 2d 41 20 41 3d 41 2d 42"
   "00"))
"""

s.send(pack('<HHIIIIIQp',request_length,protocol_version,platform_id,product_id,banner_id,banner_file_extension,start_position_in_file,mpq_filename,filename))




data = s.recv(BUFFER_SIZE)

print("DATA : ",data)


s.close()


"""
s.send(bytes.fromhex("FF 51 8A 00 4A 7C B0 BA 00 0D 00 01 58 05"
 "5B 63 02 00 00 00 00 00 00 00 1A 00 00 00 18 00"
 "00 00 76 92 A6 00 00 00 00 00 45 00 1F 9C 42 26"
 "CD E9 42 DE E5 1D E6 42 11 14 8B 32 0F DF 1A 00"
 "00 00 19 00 00 00 66 6B 5E 00 00 00 00 00 C8 C4"
 "B7 79 69 DD 45 67 4A 0A C3 D4 5D E5 69 02 D7 2F"
 "68 5B 47 61 6D 65 2E 65 78 65 20 31 30 2F 31 38"
 "2F 31 31 20 32 30 3A 34 38 3A 31 34 20 36 35 35"
 "33 36 00 73 6F 6E 6C 69 67 68 74 00"))

#data = s.recv(BUFFER_SIZE)
#print ("received data:", data)

s2.send(bytes.fromhex("ff 51 09 00 00 00 00 00 00"))

s.send(bytes.fromhex("FF 33 1E 00 04 00 00 80 00 00 00 00 62 6E"
 "73 65 72 76 65 72 2D 44 32 44 56 2E 69 6E 69 00"))

s2.send(bytes.fromhex("FF 33 1E 00 04 00 00 80 00 00 00 00 62 6E"
 "73 65 72 76 65 72 2D 44 32 44 56 2E 69 6E 69 00"))
#data = s.recv(BUFFER_SIZE)
#print ("received data:", data)

s.send(bytes.fromhex("FF 3A 29 00 F9 39 65 03 D0 98 4E 5A A7 7C"
 "A5 00 27 65 5F 42 28 47 E9 CF 58 E3 03 CD 80 40"
 "89 2F 75 72 75 6B 75 62 61 6C 00"
))


s2.send(bytes.fromhex("ff 3a 08 00 00 00 00 00"))

#data = s.recv(BUFFER_SIZE)
#print ("received data:", data)

s.send(bytes.fromhex('FF 40 04 00'))
#data = s.recv(BUFFER_SIZE)
#print ("received data:", data)

s2.send(bytes.fromhex("ff 40 2e 00 00 00 00 00 01 00 00 00 01 00 00 00"
   "50 61 74 68 20 6f 66 20 44 69 61 62 6c 6f 00 50"
   "61 74 68 20 6f 66 20 44 69 61 62 6c 6f 00"))


s.send(bytes.fromhex("FF 3E 2B 00 01 00 00 00 79 9F B7 9B 86 16"
 "1A 38 92 11 4B 3F 4D 9F A0 2B B1 FF A8 62 50 61"
 "74 68 20 6F 66 20 44 69 61 62 6C 6F 00"))


s2.send(bytes.fromhex("ff 3e 55 00 03 00 00 00 00 00 00 00 00 00 00 00"
   "0a 0c 00 00 b0 1f 26 e4 17 e1 00 00 96 66 4f 5a"
   "00 00 00 00 00 00 00 00 50 58 32 44 0d 00 00 00"
   "00 00 00 00 00 00 00 00 0f 39 50 ae f5 76 ab f9"
   "9f 9b 4d 16 a3 db 33 23 17 ae 35 8c 55 72 75 6b"
   "75 62 61 6c 00"))

TCP_PORT = 6113
s.close()
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((TCP_IP, TCP_PORT))


s.send(bytes.fromhex('D2 00'))

s.send(bytes.fromhex('01'))

s.send(bytes.fromhex("4C 00 01 01 00 00 00 00 00 00 00 00 00 00"
 "00 39 09 00 00 D0 98 4E 5A 00 00 00 00 00 00 00"
 "00 50 58 32 44 0D 00 00 00 00 00 00 00 00 00 00"
 "00 FA CB 19 11 65 1C DA 2A 7E 53 FD 8B D6 2D 63"
 "02 29 8E 8A 1B 55 72 75 6B 75 62 61 6C 00"))


s2.send(bytes.fromhex('07 00 01 00 00 00 00'))

s.send(bytes.fromhex("07 00 19 08 00 00 00"))

s2.send(bytes.fromhex("3a 00 19 12 00 01 00 00 00 01 00 ff ff ff 7f 55"
   "72 75 6b 75 62 61 6c 00 8d 80 39 02 01 01 01 35"
   "ff 51 02 02 ff 02 4d 46 46 46 46 ff ff ff 46 46"
   "ff 5d e0 9a 80 80 01 ff ff 00"))

s.send(bytes.fromhex('0C 00 07 55 72 75 6B 75 62 61 6C 00'))

s2.sent(bytes.fromhex('07 00 07 00 00 00 00'))

s.send(bytes.fromhex('03 00 12'))

TCP_PORT = 6112
s.close()
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((TCP_IP, TCP_PORT))



s.send(bytes.fromhex('FF 0B 08 00 50 58 32 44'))

s.send(bytes.fromhex("FF 0A 25 00 55 72 75 6B 75 62 61 6C 00 50"
 "61 74 68 20 6F 66 20 44 69 61 62 6C 6F 2C 55 72"
 "75 6B 75 62 61 6C 00"))

s2.send(bytes.fromhex("ff 0b 11 00 44 69 61 62 6c 6f 20 49 49 2d 31 00"
	"00"))

s2.send(bytes.fromhex("65 00 12 00 55 73 69 6e 67 20 63 68 65 61 74 73"
   "20 6c 69 6b 65 20 6d 61 70 68 61 63 6b 2c 20 62"
   "6f 74 73 2c 20 6d 75 6c 74 69 63 6c 69 65 6e 74"
   "73 3b 20 77 69 6c 6c 20 67 65 74 20 79 6f 75 20"
   "62 61 6e 6e 65 64 2e 20 47 6f 20 74 6f 20 70 61"
   "74 68 6f 66 64 69 61 62 6c 6f 2e 63 6f 6d 2f 72"
   "75 6c 65 73 00"))

s2.send(bytes.fromhex("ff 0a 54 00 55 72 75 6b 75 62 61 6c 00 50 58 32"
   "44 50 61 74 68 20 6f 66 20 44 69 61 62 6c 6f 2c"
   "55 72 75 6b 75 62 61 6c 2c 8d 80 39 02 01 01 01"
   "35 ff 51 02 02 ff 02 4d 46 46 46 46 ff ff ff 46"
   "46 ff 5d e0 9a 80 80 01 ff ff 00 55 72 75 6b 75"
   "62 61 6c 00"))


s.send(bytes.fromhex('FF 46 08 00 3F 0F D7 59'))

s.send(bytes.fromhex("ff 46 61 01 01 d6 60 4f 5a 3e 0f d7 59 3f 0f d7"
   "59 00 00 00 00 7c 63 30 30 46 46 30 30 30 30 57"
   "65 6c 63 6f 6d 65 20 7c 63 30 30 46 46 39 39 33"
   "33 74 6f 20 7c 63 30 30 30 30 43 43 46 46 74 68"
   "65 20 7c 63 30 30 46 46 36 36 46 46 50 61 74 68"
   "20 6f 66 20 44 69 61 62 6c 6f 20 7c 63 30 30 30"
   "30 43 43 30 30 56 65 72 73 69 6f 6e 20 7c 63 30"
   "30 39 39 39 39 46 46 50 76 50 47 4e 20 31 2e 39"
   "39 2e 37 2e 31 2e 31 2d 50 52 4f 20 7c 63 30 30"
   "46 46 46 46 46 46 0a 0a 54 68 65 72 65 20 61 72"
   "65 20 63 75 72 72 65 6e 74 6c 79 20 34 32 20 75"
   "73 65 72 28 73 29 20 69 6e 20 32 33 20 67 61 6d"
   "65 73 20 6f 66 20 44 69 61 62 6c 6f 20 49 49 20"
   "4c 6f 72 64 20 6f 66 20 44 65 73 74 72 75 63 74"
   "69 6f 6e 2c 20 61 6e 64 20 34 33 20 75 73 65 72"
   "28 73 29 20 70 6c 61 79 69 6e 67 20 32 33 20 67"
   "61 6d 65 73 20 61 6e 64 20 63 68 61 74 74 69 6e"
   "67 20 69 6e 20 34 33 20 63 68 61 6e 6e 65 6c 73"
   "2e 0a 0a 0a 0a 0a 0a 0a 0a 54 68 69 73 20 74 65"
   "78 74 20 69 6e 76 69 73 69 62 6c 65 2c 20 62 65"
   "63 61 75 73 65 20 6f 66 20 6c 69 6d 69 74 61 74"
   "69 6f 6e 20 6f 66 20 31 31 20 6c 69 6e 65 73 0a"
   "00"))




s.send(bytes.fromhex("FF 0C 12 00 05 00 00 00 44 69 61 62 6C 6F"
 "20 49 49 00"))

#data = s.recv(BUFFER_SIZE)
#print ("received data:", data)

s.close()
"""