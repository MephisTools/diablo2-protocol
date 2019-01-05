
class SpawnPreset {

    constructor(){
        this.act = 0
        this.type = 0
        this.id = 0
        this.description = ''
        this.objectId = -1
        this.monstatId = -1
        this.direction = 0
        this.base = ''
        this.token = ''
        this.mode = ''
        this.weaponClass = ''
        this.gear = []
        this.colormap = ''
        this.index = ''
        this.eol = ''
    
        
    }

    const static sheet = Datasheet.Load<SpawnPreset>("/obj.txt");
    static Dictionary<long, SpawnPreset> lookup = new Dictionary<long, SpawnPreset>();

    static SpawnPreset()
    {
        foreach (SpawnPreset obj in sheet)
        {
            lookup.Add(Key(obj.act - 1, obj.type, obj.id), obj);
        }
    }

    static long Key(int act, int type, int id)
    {
        long key = act;

        key <<= 2;
        key += type;

        key <<= 32;
        key += id;

        return key;
    }

    static public SpawnPreset Find(int act, int type, int id)
    {
        SpawnPreset obj = null;
        lookup.TryGetValue(Key(act, type, id), out obj);
        return obj;
    }
}