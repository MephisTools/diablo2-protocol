const fs = require('fs')

class Datasheet
{
    static Load(filename, headerLines = 1) {
        const csv = fs.readFileSync("/" + filename) // TODO: Fix that path
        
        var lines = csv.split('\n')
        var sheet = []
        for (let lineIndex = 0; lineIndex < lines.Length; ++lineIndex) {
            const line = lines[lineIndex]
            line = line.replace('\\r', '')
            if (line.Length == 0) {
                continue
            }
            const members = FormatterServices.GetSerializableMembers(typeof(T))
            const fields = line.split('\t');

            if (lineIndex < headerLines) {
                continue
            }

            const obj = {}
            Datasheet.readObject(obj, members, fields)
            sheet.push(obj)

        }
        return sheet
    }

    static calcFieldCount(type)
    {
        const members = FormatterServices.GetSerializableMembers(type);
        if (members.Length == 0) {
            return 1
        }

        let fieldCount = 0
        members.forEach(member => {
            const fi = member
            if (fi.FieldType.IsArray)
            {
                const seq = (Sequence)System.Attribute.GetCustomAttribute(member, typeof(Sequence), true);
                const elementType = fi.FieldType.GetElementType();
                const elementFieldCount = CalcFieldCount(elementType);
                fieldCount += seq.length * elementFieldCount;
            }
            else
            {
                fieldCount += 1
            }
        })

        return fieldCount
    }

    static readObject(obj, members, fields, fieldIndex = 0)
    {
        for (let memberIndex = 0; memberIndex < members.Length; ++memberIndex)
        {
            const member = members[memberIndex]
            fieldIndex = Datasheet.ReadMember(obj, member, fields, fieldIndex)
        }
        return fieldIndex;
    }

    static readMember(obj, member, fields, fieldIndex)
    {
        const fi = member
        if (fi.FieldType.IsArray)
        {
            const elementType = fi.FieldType.GetElementType();
            const seq = (Sequence)System.Attribute.GetCustomAttribute(fi, typeof(Sequence), true);
            const array = (IList)System.Array.CreateInstance(elementType, seq.length);
            fi.SetValue(obj, array);
            const elementMembers = FormatterServices.GetSerializableMembers(elementType);
            for (let i = 0; i < array.Count; ++i)
            {
                if (elementMembers.Length === 0)
                {
                    array[i] = CastValue(fields[fieldIndex], elementType, array[i]);
                    ++fieldIndex
                }
                else
                {
                    const element = System.Activator.CreateInstance(elementType)
                    fieldIndex = Datasheet.readObject(element, elementMembers, fields, fieldIndex)
                    array[i] = element
                }
            }
        }
        else
        {
            var value = Datasheet.castValue(fields[fieldIndex], fi.FieldType, fi.GetValue(obj))
            fi.SetValue(obj, value)
            ++fieldIndex
        }

        return fieldIndex
    }

    static castValue(value, type, defaultValue)
    {
        if (value === '' || value === 'xxx') {
            return defaultValue
        }

        if (type === typeof(bool))
        {
            if (value === '1') {
                return true
            }
            else if (value === '0') {
                return false
            }
        }
    }
}