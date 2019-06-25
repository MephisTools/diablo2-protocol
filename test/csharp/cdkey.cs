using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Collections;

namespace BattleNet
{
    public class CdKey
    {
        static readonly byte[] alphaMap =
	    {
		    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0xFF, 0xFF,	0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0x00, 0xFF, 0x01, 0xFF, 0x02, 0x03,
		    0x04, 0x05, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B,
		    0x0C, 0xFF, 0x0D, 0x0E, 0xFF, 0x0F, 0x10, 0xFF,
		    0x11, 0xFF,	0x12, 0xFF, 0x13, 0xFF, 0x14, 0x15,
		    0x16, 0xFF, 0x17, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B,
		    0x0C, 0xFF, 0x0D, 0x0E, 0xFF, 0x0F, 0x10, 0xFF,
		    0x11, 0xFF, 0x12, 0xFF, 0x13, 0xFF, 0x14, 0x15,
		    0x16, 0xFF, 0x17, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF,	0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF
	    };

        protected static char ConvertToHexDigit(ulong byt)
        {
            byt &= 0xF;
            if (byt < 10)
                return (char)(byt + 0x30);
            else
                return (char)(byt + 0x37);
        }

        protected static ulong ConvertFromHexDigit(char input)
        {
            if (input >= '0' && input <= '9')
                return (ulong)(input - 0x30);
            else
                return (ulong)(input - 0x37);
        }

        public static bool GetD2KeyHash(string cdkey, ref uint client_token, uint server_token, ref List<byte> output, ref  List<byte> public_value)
        {
            ulong checksum = 0;
            ulong n, n2, v, v2;
            char c1, c2, c;

            String manipulatedKey = cdkey;

            for (int i = 0; i < cdkey.Length; i += 2)
            {
                char[] tmpBuffer = manipulatedKey.ToCharArray();
                c1 = (char)alphaMap[cdkey[i]];
                n = (ulong)c1 * 3;
                c2 = (char)alphaMap[cdkey[i + 1]];
                n = (ulong)c2 + 8 * n;

                if (n >= 0x100)
                {
                    n -= 0x100;
                    ulong temp = (ulong)1 << (i >> 1);
                    checksum |= temp;
                }
                n2 = n;
                n2 >>= 4;
                tmpBuffer[i] = ConvertToHexDigit(n2);
                tmpBuffer[i + 1] = ConvertToHexDigit(n);

                manipulatedKey = new string(tmpBuffer);
            }

            v = 3;

            for (int i = 0; i < 16; i++)
            {
                n = ConvertFromHexDigit(manipulatedKey[i]);
                n2 = v * 2;
                n ^= n2;
                v += n;
            }

            v &= 0xFF;
            if (v != checksum)
                return false;

            for (int i = 15; i >= 0; i--)
            {
                c = manipulatedKey[i];
                if (i > 8)
                    n = (ulong)i - 9;
                else
                    n = 0xF - (ulong)(8 - i);
                n &= 0xF;

                c2 = manipulatedKey[(int)n];
                char[] tmpBuffer = manipulatedKey.ToCharArray();
                tmpBuffer[i] = c2;
                tmpBuffer[n] = c;
                manipulatedKey = new string(tmpBuffer);
            }

            v2 = 0x13AC9741;

            for (int i = 15; i >= 0; i--)
            {
                c = char.ToUpper(manipulatedKey[i]);
                char[] tmpBuffer = manipulatedKey.ToCharArray();
                tmpBuffer[i] = c;


                if (c <= '7')
                {
                    v = v2;
                    c2 = (char)(v & 0xFF);
                    c2 &= (char)7;
                    c2 ^= c;
                    v >>= 3;
                    tmpBuffer[i] = c2;
                    v2 = v;
                }
                else if (c < 'A')
                {
                    c2 = (char)i;
                    c2 &= (char)1;
                    c2 ^= c;
                    tmpBuffer[i] = c2;
                }
                manipulatedKey = new string(tmpBuffer);
            }

            string hexString = manipulatedKey.Substring(2, 6);
            UInt32 num = Convert.ToUInt32(hexString , 16);

            public_value = new List<byte>(BitConverter.GetBytes(num));

            List<byte> hashData = new List<byte>(BitConverter.GetBytes(client_token));
            hashData.AddRange(BitConverter.GetBytes(server_token));


            hashData.AddRange(BitConverter.GetBytes(Convert.ToUInt32(manipulatedKey.Substring(0, 2), 16)));

            hashData.AddRange(BitConverter.GetBytes(num));
            hashData.AddRange(BitConverter.GetBytes((int)0));
            hashData.AddRange(BitConverter.GetBytes(Convert.ToUInt32(manipulatedKey.Substring(8, 8), 16)));

            output = GetHash(hashData);

            return true;
        }
                              protected static void setBufferByte(uint[] buffer, int offset, byte val)
        {
            int index = offset / 4;
            int position = offset % 4;
            int bit_offset = 8 * position;
            buffer[index] &= (uint)(0xFF << bit_offset) ^ 0xFFFFFFFF;
            buffer[index] |= (uint)val << bit_offset;
        }

        protected static byte getBufferByte(uint[] buffer, int offset)
        {
            int index = offset / 4;
            int position = offset % 4;
            int bit_offset = 8 * position;
            return (byte)((buffer[index] >> bit_offset) & 0xff);
        }

        protected static void CalculateHash(ref uint[] buffer)
        {
	        uint[] hash_buffer = new uint[80];
	        uint hash, a, b, c, d, e, hash_buffer_offset;

            for (uint i = 0; i < 0x10; i++)
            {
                hash_buffer[i] = buffer[(int)i + 5];
            }

	        for(uint i = 0x10; i <hash_buffer.Length; i++)
	        {
			        hash = hash_buffer[i - 0x10] ^ hash_buffer[i - 0x8] ^ hash_buffer[i - 0xE] ^ hash_buffer[i - 0x3];
			        hash_buffer[i] = (uint)((1 >> (int)(0x20 - (hash & 0xff))) | (1 << (int)(hash & 0xff)));
	        }

	        a = buffer[0];
	        b = buffer[1];
	        c = buffer[2];
	        d = buffer[3];
	        e = buffer[4];

	        hash_buffer_offset = 0;

	        for(uint i = 0; i < 20; i++, hash_buffer_offset++)
	        {
			        hash = ((a << 5) | (a >> 0x1b)) + ((~b & d) | (c & b)) + e + hash_buffer[hash_buffer_offset] + 0x5A827999;
			        e = d;
			        d = c;
			        c = (b >> 2) | (b << 0x1e);
			        b = a;
			        a = hash;
	        }

	        for(uint i = 0; i < 20; i++, hash_buffer_offset++)
	        {
			        hash = (d ^ c ^ b) + e + ((a << 5) | (a >> 0x1b)) + hash_buffer[hash_buffer_offset] + 0x6ED9EBA1;
			        e = d;
			        d = c;
			        c = (b >> 2) | (b << 0x1e);
			        b = a;
			        a = hash;
	        }

	        for(uint i = 0; i < 20; i++, hash_buffer_offset++)
	        {
			        hash = ((c & b) | (d & c) | (d & b)) + e + ((a << 5) | (a >> 0x1b)) + hash_buffer[hash_buffer_offset] - 0x70E44324;
			        e = d;
			        d = c;
			        c = (b >> 2) | (b << 0x1e);
			        b = a;
			        a = hash;
	        }

	        for(uint i = 0; i < 20; i++, hash_buffer_offset++)
	        {
			        hash = ((a << 5) | (a >> 0x1b)) + e + (d ^ c ^ b) + hash_buffer[hash_buffer_offset] - 0x359D3E2A;
			        e = d;
			        d = c;
			        c = (b >> 2) | (b << 0x1e);
			        b = a;
			        a = hash;
	        }

	        buffer[0] += a;
	        buffer[1] += b;
	        buffer[2] += c;
	        buffer[3] += d;
	        buffer[4] += e;
        }



        public static List<byte> GetHash(List<byte> input)
        {
            uint[] buffer = new uint[21];
            buffer[0] = 0x67452301;
            buffer[1] = 0xEFCDAB89;
            buffer[2] = 0x98BADCFE;
            buffer[3] = 0x10325476;
            buffer[4] = 0xC3D2E1F0;

            uint max_subsection_length = 64;
            uint initialized_length = 20;

            for(uint i = 0 ; i < input.Count ; i += max_subsection_length)
            {
                uint subsection_length = Math.Min(max_subsection_length,(uint)input.Count-i);

                if (subsection_length > max_subsection_length)
                    subsection_length = max_subsection_length;

                for (uint j = 0; j < subsection_length; j++)
                {
                    byte[] temp = new byte[input.Count];
                    input.CopyTo(temp);
                    setBufferByte(buffer, (int)(initialized_length + j), temp[(int)(j + i)]);
                }

                if(subsection_length < max_subsection_length)
                {
                    for(uint j = subsection_length ; j < max_subsection_length ; j++)
                        setBufferByte(buffer, (int)(initialized_length+j),0);
                }

                CalculateHash(ref buffer);

            }

            List<byte> op = new List<byte>();
            for (uint i = 0; i < buffer.Length; i++)
                for (uint j = 0; j < 4; j++)
                    op.Add(getBufferByte(buffer, (int)(i * 4 + j)));
            return new List<byte>(op.GetRange(0,20));
        }
		
		public static void Main(string[] args)
		{
			List<byte> output = new List<byte>();
			List<byte> public_value = new List<byte>();
			uint a = 2745197048;
			Console.WriteLine(CdKey.GetD2KeyHash("ABDETR5Y24GE14J", ref a, 3442976300, ref output, ref public_value));
			Console.WriteLine(BitConverter.ToString(output.ToArray()));
			Console.WriteLine(BitConverter.ToString(public_value.ToArray()));			
		}
    }
}
