/**
 * Dictionary loading and word validation
 */

const Dictionary = (function() {
    let wordSet = new Set();
    let isLoaded = false;
    let loadPromise = null;

    // Load word list from file
    async function load() {
        if (loadPromise) return loadPromise;

        loadPromise = fetch('data/words.txt')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load dictionary');
                }
                return response.text();
            })
            .then(text => {
                const words = text.split('\n')
                    .map(word => word.trim().toUpperCase())
                    .filter(word => word.length >= 2 && word.length <= 18);

                wordSet = new Set(words);
                isLoaded = true;
                console.log(`Dictionary loaded: ${wordSet.size} words`);
                return true;
            })
            .catch(error => {
                console.error('Dictionary load error:', error);
                // Fallback to a minimal built-in dictionary
                loadFallbackDictionary();
                return true;
            });

        return loadPromise;
    }

    // Fallback dictionary with common words
    function loadFallbackDictionary() {
        const commonWords = [
            'A', 'I', 'AM', 'AN', 'AS', 'AT', 'BE', 'BY', 'DO', 'GO', 'HE', 'IF', 'IN', 'IS', 'IT', 'ME', 'MY', 'NO', 'OF', 'ON', 'OR', 'SO', 'TO', 'UP', 'US', 'WE',
            'ACE', 'ACT', 'ADD', 'AGE', 'AGO', 'AID', 'AIM', 'AIR', 'ALL', 'AND', 'ANT', 'ANY', 'APE', 'ARC', 'ARE', 'ARK', 'ARM', 'ART', 'ASK', 'ATE', 'AWE',
            'BAD', 'BAG', 'BAN', 'BAR', 'BAT', 'BED', 'BEE', 'BET', 'BIG', 'BIT', 'BOW', 'BOX', 'BOY', 'BUD', 'BUG', 'BUS', 'BUT', 'BUY',
            'CAB', 'CAN', 'CAP', 'CAR', 'CAT', 'COB', 'COD', 'COT', 'COW', 'CRY', 'CUB', 'CUD', 'CUP', 'CUT',
            'DAD', 'DAM', 'DAY', 'DEN', 'DEW', 'DID', 'DIG', 'DIM', 'DIP', 'DOC', 'DOE', 'DOG', 'DOT', 'DRY', 'DUB', 'DUD', 'DUE', 'DUG', 'DYE',
            'EAR', 'EAT', 'EEL', 'EGG', 'ELF', 'ELK', 'ELM', 'END', 'ERA', 'EVE', 'EWE', 'EYE',
            'FAD', 'FAN', 'FAR', 'FAT', 'FAX', 'FED', 'FEE', 'FEW', 'FIG', 'FIN', 'FIT', 'FIX', 'FLY', 'FOB', 'FOE', 'FOG', 'FOR', 'FOX', 'FRY', 'FUN', 'FUR',
            'GAB', 'GAG', 'GAP', 'GAS', 'GAY', 'GEL', 'GEM', 'GET', 'GIG', 'GIN', 'GNU', 'GOB', 'GOD', 'GOT', 'GUM', 'GUN', 'GUT', 'GUY', 'GYM',
            'HAD', 'HAM', 'HAS', 'HAT', 'HAY', 'HEM', 'HEN', 'HER', 'HEW', 'HID', 'HIM', 'HIP', 'HIS', 'HIT', 'HOB', 'HOG', 'HOP', 'HOT', 'HOW', 'HUB', 'HUE', 'HUG', 'HUM', 'HUT',
            'ICE', 'ICY', 'ILL', 'IMP', 'INK', 'INN', 'ION', 'IRE', 'IRK', 'ITS', 'IVY',
            'JAB', 'JAG', 'JAM', 'JAR', 'JAW', 'JAY', 'JET', 'JIG', 'JOB', 'JOG', 'JOT', 'JOY', 'JUG', 'JUT',
            'KEG', 'KEN', 'KEY', 'KID', 'KIN', 'KIT',
            'LAB', 'LAC', 'LAD', 'LAG', 'LAP', 'LAW', 'LAX', 'LAY', 'LEA', 'LED', 'LEG', 'LET', 'LID', 'LIE', 'LIP', 'LIT', 'LOG', 'LOT', 'LOW', 'LUG',
            'MAD', 'MAN', 'MAP', 'MAR', 'MAT', 'MAW', 'MAY', 'MEN', 'MET', 'MID', 'MIX', 'MOB', 'MOM', 'MOP', 'MOW', 'MUD', 'MUG', 'MUM',
            'NAB', 'NAG', 'NAP', 'NAY', 'NET', 'NEW', 'NIL', 'NIP', 'NIT', 'NOB', 'NOD', 'NOR', 'NOT', 'NOW', 'NUB', 'NUN', 'NUT',
            'OAK', 'OAR', 'OAT', 'ODD', 'ODE', 'OFF', 'OFT', 'OHM', 'OIL', 'OLD', 'ONE', 'OPT', 'ORB', 'ORE', 'OUR', 'OUT', 'OWE', 'OWL', 'OWN',
            'PAD', 'PAL', 'PAN', 'PAP', 'PAR', 'PAT', 'PAW', 'PAY', 'PEA', 'PEG', 'PEN', 'PEP', 'PER', 'PET', 'PEW', 'PIE', 'PIG', 'PIN', 'PIT', 'PLY', 'POD', 'POP', 'POT', 'POW', 'PRY', 'PUB', 'PUG', 'PUN', 'PUP', 'PUS', 'PUT',
            'RAG', 'RAM', 'RAN', 'RAP', 'RAT', 'RAW', 'RAY', 'RED', 'REF', 'RIB', 'RID', 'RIG', 'RIM', 'RIP', 'ROB', 'ROD', 'ROE', 'ROT', 'ROW', 'RUB', 'RUG', 'RUM', 'RUN', 'RUT', 'RYE',
            'SAC', 'SAD', 'SAG', 'SAP', 'SAT', 'SAW', 'SAY', 'SEA', 'SET', 'SEW', 'SHE', 'SHY', 'SIN', 'SIP', 'SIR', 'SIS', 'SIT', 'SIX', 'SKI', 'SKY', 'SLY', 'SOB', 'SOD', 'SON', 'SOP', 'SOT', 'SOW', 'SOY', 'SPA', 'SPY', 'STY', 'SUB', 'SUM', 'SUN', 'SUP',
            'TAB', 'TAD', 'TAG', 'TAN', 'TAP', 'TAR', 'TAT', 'TAX', 'TEA', 'TEN', 'THE', 'THY', 'TIC', 'TIE', 'TIN', 'TIP', 'TOE', 'TON', 'TOO', 'TOP', 'TOT', 'TOW', 'TOY', 'TRY', 'TUB', 'TUG', 'TWO',
            'URN', 'USE',
            'VAN', 'VAT', 'VET', 'VIA', 'VIE', 'VOW',
            'WAD', 'WAG', 'WAR', 'WAS', 'WAX', 'WAY', 'WEB', 'WED', 'WEE', 'WET', 'WHO', 'WHY', 'WIG', 'WIN', 'WIT', 'WOE', 'WOK', 'WON', 'WOO', 'WOW',
            'YAK', 'YAM', 'YAP', 'YAW', 'YEA', 'YES', 'YET', 'YEW', 'YIN', 'YOU', 'YOW',
            'ZAP', 'ZED', 'ZEN', 'ZIP', 'ZIT', 'ZOO',
            'ABLE', 'ACHE', 'ACRE', 'AGED', 'AIDE', 'ALLY', 'ALSO', 'ARCH', 'AREA', 'ARMY', 'AUNT', 'AUTO', 'AWAY',
            'BABY', 'BACK', 'BAKE', 'BALL', 'BAND', 'BANK', 'BARN', 'BASE', 'BATH', 'BEAD', 'BEAM', 'BEAN', 'BEAR', 'BEAT', 'BEEF', 'BEEN', 'BEER', 'BELL', 'BELT', 'BEND', 'BENT', 'BEST', 'BIKE', 'BILL', 'BIND', 'BIRD', 'BITE', 'BLOW', 'BLUE', 'BOAT', 'BODY', 'BOIL', 'BOLD', 'BOLT', 'BOMB', 'BOND', 'BONE', 'BOOK', 'BOOM', 'BOOT', 'BORN', 'BOSS', 'BOTH', 'BOWL', 'BRED', 'BULK', 'BULL', 'BURN', 'BURY', 'BUSH', 'BUSY', 'BUTT',
            'CAFE', 'CAGE', 'CAKE', 'CALF', 'CALL', 'CALM', 'CAME', 'CAMP', 'CAPE', 'CARD', 'CARE', 'CART', 'CASE', 'CASH', 'CAST', 'CAVE', 'CELL', 'CHAT', 'CHEF', 'CHIP', 'CITY', 'CLAP', 'CLAY', 'CLIP', 'CLUB', 'CLUE', 'COAL', 'COAT', 'CODE', 'COIN', 'COLD', 'COME', 'COOK', 'COOL', 'COPE', 'COPY', 'CORE', 'CORN', 'COST', 'COZY', 'CRAB', 'CREW', 'CROP', 'CULT', 'CURE', 'CURL', 'CUTE',
            'DAME', 'DAMP', 'DARE', 'DARK', 'DASH', 'DATA', 'DATE', 'DAWN', 'DEAD', 'DEAL', 'DEAR', 'DEBT', 'DECK', 'DEED', 'DEEM', 'DEEP', 'DEER', 'DENY', 'DESK', 'DIAL', 'DICE', 'DIED', 'DIET', 'DIME', 'DINE', 'DIRT', 'DISC', 'DISH', 'DIVE', 'DOCK', 'DOES', 'DOLL', 'DOME', 'DONE', 'DOOM', 'DOOR', 'DOSE', 'DOTE', 'DOWN', 'DRAG', 'DRAW', 'DREW', 'DRIP', 'DROP', 'DRUG', 'DRUM', 'DUAL', 'DUCK', 'DUDE', 'DUEL', 'DUKE', 'DULL', 'DUMB', 'DUMP', 'DUNK', 'DUST', 'DUTY',
            'EACH', 'EARN', 'EASE', 'EAST', 'EASY', 'ECHO', 'EDGE', 'EDIT', 'ELSE', 'EMIT', 'ENVY', 'EPIC', 'EVEN', 'EVER', 'EVIL', 'EXAM', 'EXIT', 'EYED', 'EYES',
            'FACE', 'FACT', 'FADE', 'FAIL', 'FAIR', 'FAKE', 'FALL', 'FAME', 'FANG', 'FARE', 'FARM', 'FAST', 'FATE', 'FEAR', 'FEAT', 'FEED', 'FEEL', 'FEET', 'FELL', 'FELT', 'FERN', 'FEST', 'FILE', 'FILL', 'FILM', 'FIND', 'FINE', 'FIRE', 'FIRM', 'FISH', 'FIST', 'FLAG', 'FLAT', 'FLAW', 'FLED', 'FLED', 'FLEW', 'FLIP', 'FLOW', 'FOAM', 'FOLD', 'FOLK', 'FOND', 'FOOD', 'FOOL', 'FOOT', 'FORD', 'FORE', 'FORK', 'FORM', 'FORT', 'FOUL', 'FOUR', 'FOWL', 'FREE', 'FROG', 'FROM', 'FUEL', 'FULL', 'FUND', 'FUSE', 'FUSS',
            'GAIN', 'GALE', 'GAME', 'GANG', 'GATE', 'GAVE', 'GAZE', 'GEAR', 'GENE', 'GIFT', 'GIRL', 'GIVE', 'GLAD', 'GLOW', 'GLUE', 'GOAT', 'GOES', 'GOLD', 'GOLF', 'GONE', 'GOOD', 'GORE', 'GRAB', 'GRAM', 'GRAY', 'GREW', 'GREY', 'GRID', 'GRIM', 'GRIN', 'GRIP', 'GROW', 'GULF', 'GURU', 'GUST',
            'HACK', 'HAIL', 'HAIR', 'HALF', 'HALL', 'HALT', 'HAND', 'HANG', 'HARD', 'HARM', 'HARP', 'HATE', 'HAUL', 'HAVE', 'HAWK', 'HEAD', 'HEAL', 'HEAP', 'HEAR', 'HEAT', 'HEEL', 'HELD', 'HELL', 'HELM', 'HELP', 'HERB', 'HERD', 'HERE', 'HERO', 'HIGH', 'HIKE', 'HILL', 'HINT', 'HIRE', 'HOLD', 'HOLE', 'HOLY', 'HOME', 'HOOD', 'HOOK', 'HOPE', 'HORN', 'HOST', 'HOUR', 'HUGE', 'HULL', 'HUNG', 'HUNT', 'HURT',
            'ICED', 'ICON', 'IDEA', 'IDLE', 'INCH', 'INTO', 'IRON', 'ISLE', 'ITEM',
            'JACK', 'JADE', 'JAIL', 'JANE', 'JAVA', 'JAZZ', 'JEANS', 'JERK', 'JEST', 'JOHN', 'JOIN', 'JOKE', 'JOLT', 'JULY', 'JUMP', 'JUNE', 'JUNK', 'JURY', 'JUST',
            'KEEN', 'KEEP', 'KEPT', 'KICK', 'KIDS', 'KILL', 'KIND', 'KING', 'KISS', 'KITE', 'KNEE', 'KNEW', 'KNIT', 'KNOB', 'KNOT', 'KNOW',
            'LACE', 'LACK', 'LADY', 'LAID', 'LAKE', 'LAMB', 'LAMP', 'LAND', 'LANE', 'LAPS', 'LAST', 'LATE', 'LAWN', 'LEAD', 'LEAF', 'LEAN', 'LEAP', 'LEFT', 'LEND', 'LENS', 'LESS', 'LIAR', 'LICE', 'LICK', 'LIFE', 'LIFT', 'LIKE', 'LIMB', 'LIME', 'LINE', 'LINK', 'LION', 'LIPS', 'LIST', 'LIVE', 'LOAD', 'LOAF', 'LOAN', 'LOCK', 'LOGO', 'LONE', 'LONG', 'LOOK', 'LOOP', 'LORD', 'LOSE', 'LOSS', 'LOST', 'LOTS', 'LOUD', 'LOVE', 'LUCK', 'LUMP', 'LUNG', 'LURE', 'LURK', 'LUSH',
            'MADE', 'MAIL', 'MAIN', 'MAKE', 'MALE', 'MALL', 'MANY', 'MAPS', 'MARK', 'MARS', 'MASK', 'MASS', 'MATE', 'MATH', 'MAZE', 'MEAL', 'MEAN', 'MEAT', 'MEEK', 'MEET', 'MELT', 'MEMO', 'MENU', 'MERE', 'MESH', 'MESS', 'MICE', 'MILD', 'MILE', 'MILK', 'MILL', 'MIND', 'MINE', 'MINT', 'MISS', 'MIST', 'MODE', 'MOLD', 'MONK', 'MOOD', 'MOON', 'MORE', 'MOSS', 'MOST', 'MOTH', 'MOVE', 'MUCH', 'MULE', 'MUST', 'MUTE',
            'NAIL', 'NAME', 'NAVY', 'NEAR', 'NEAT', 'NECK', 'NEED', 'NEST', 'NEWS', 'NEXT', 'NICE', 'NICK', 'NINE', 'NODE', 'NONE', 'NOON', 'NORM', 'NOSE', 'NOTE', 'NOUN', 'NUTS',
            'OATH', 'OBEY', 'ODDS', 'OKAY', 'ONCE', 'ONLY', 'ONTO', 'OPEN', 'ORAL', 'OVEN', 'OVER', 'OWED', 'OWNS',
            'PACE', 'PACK', 'PAGE', 'PAID', 'PAIN', 'PAIR', 'PALE', 'PALM', 'PANE', 'PANT', 'PARK', 'PART', 'PASS', 'PAST', 'PATH', 'PAVE', 'PEAK', 'PEAR', 'PECK', 'PEEK', 'PEEL', 'PEER', 'PEST', 'PICK', 'PIER', 'PILE', 'PILL', 'PINE', 'PINK', 'PIPE', 'PITY', 'PLAN', 'PLAY', 'PLEA', 'PLOW', 'PLUG', 'PLUM', 'PLUS', 'POEM', 'POET', 'POKE', 'POLE', 'POLL', 'POLO', 'POND', 'PONY', 'POOL', 'POOR', 'POPE', 'PORK', 'PORT', 'POSE', 'POST', 'POUR', 'PRAY', 'PREP', 'PREY', 'PROP', 'PULL', 'PULP', 'PUMP', 'PURE', 'PUSH',
            'QUIT', 'QUIZ',
            'RACE', 'RACK', 'RAGE', 'RAID', 'RAIL', 'RAIN', 'RAMP', 'RANG', 'RANK', 'RARE', 'RASH', 'RATE', 'RAVE', 'READ', 'REAL', 'REAP', 'REAR', 'REDO', 'REED', 'REEF', 'REEL', 'RELY', 'RENT', 'REST', 'RICE', 'RICH', 'RIDE', 'RIFT', 'RING', 'RIOT', 'RIPE', 'RISE', 'RISK', 'ROAD', 'ROAM', 'ROAR', 'ROBE', 'ROCK', 'RODE', 'ROLE', 'ROLL', 'ROOF', 'ROOM', 'ROOT', 'ROPE', 'ROSE', 'ROSY', 'RUIN', 'RULE', 'RUSH', 'RUST',
            'SACK', 'SAFE', 'SAGA', 'SAGE', 'SAID', 'SAIL', 'SAKE', 'SALE', 'SALT', 'SAME', 'SAND', 'SANE', 'SANG', 'SANK', 'SAVE', 'SCAN', 'SEAL', 'SEAM', 'SEAT', 'SEED', 'SEEK', 'SEEM', 'SEEN', 'SELF', 'SELL', 'SEMI', 'SEND', 'SENT', 'SETS', 'SHED', 'SHIN', 'SHIP', 'SHOE', 'SHOP', 'SHOT', 'SHOW', 'SHUT', 'SICK', 'SIDE', 'SIFT', 'SIGH', 'SIGN', 'SILK', 'SING', 'SINK', 'SITE', 'SIZE', 'SKIM', 'SKIN', 'SKIP', 'SLAM', 'SLAP', 'SLED', 'SLEW', 'SLID', 'SLIM', 'SLIP', 'SLIT', 'SLOT', 'SLOW', 'SLUG', 'SNAP', 'SNOW', 'SOAK', 'SOAP', 'SOAR', 'SOCK', 'SODA', 'SOFA', 'SOFT', 'SOIL', 'SOLD', 'SOLE', 'SOME', 'SONG', 'SOON', 'SORE', 'SORT', 'SOUL', 'SOUP', 'SOUR', 'SPAN', 'SPAR', 'SPEC', 'SPED', 'SPIN', 'SPIT', 'SPOT', 'STAB', 'STAR', 'STAY', 'STEM', 'STEP', 'STEW', 'STIR', 'STOP', 'STOW', 'STUB', 'STUD', 'SUCH', 'SUCK', 'SUIT', 'SUNG', 'SUNK', 'SURE', 'SURF', 'SWAP', 'SWIM',
            'TABS', 'TACK', 'TAIL', 'TAKE', 'TALE', 'TALK', 'TALL', 'TAME', 'TANK', 'TAPE', 'TASK', 'TEAM', 'TEAR', 'TECH', 'TEEN', 'TELL', 'TEND', 'TENT', 'TERM', 'TEST', 'TEXT', 'THAN', 'THAT', 'THEM', 'THEN', 'THEY', 'THIN', 'THIS', 'THUS', 'TICK', 'TIDE', 'TIDY', 'TIED', 'TIER', 'TILE', 'TILL', 'TILT', 'TIME', 'TINY', 'TIPS', 'TIRE', 'TOAD', 'TOIL', 'TOLD', 'TOLL', 'TOMB', 'TONE', 'TOOK', 'TOOL', 'TOPS', 'TORE', 'TORN', 'TOSS', 'TOUR', 'TOWN', 'TRAP', 'TRAY', 'TREE', 'TRIM', 'TRIO', 'TRIP', 'TROT', 'TRUE', 'TUBE', 'TUCK', 'TUNA', 'TUNE', 'TURN', 'TWIN', 'TYPE',
            'UGLY', 'UNDO', 'UNIT', 'UPON', 'URGE', 'USED', 'USER',
            'VAIN', 'VARY', 'VASE', 'VAST', 'VEIN', 'VENT', 'VERB', 'VERY', 'VEST', 'VETO', 'VICE', 'VIEW', 'VINE', 'VISA', 'VOID', 'VOLT', 'VOTE',
            'WADE', 'WAGE', 'WAIT', 'WAKE', 'WALK', 'WALL', 'WAND', 'WANT', 'WARD', 'WARM', 'WARN', 'WARP', 'WARY', 'WASH', 'WASP', 'WAVE', 'WAVY', 'WAX', 'WEAK', 'WEAR', 'WEED', 'WEEK', 'WEEP', 'WELD', 'WELL', 'WENT', 'WEPT', 'WERE', 'WEST', 'WHAT', 'WHEN', 'WHIP', 'WHOM', 'WIDE', 'WIFE', 'WILD', 'WILL', 'WILT', 'WIND', 'WINE', 'WING', 'WINK', 'WIPE', 'WIRE', 'WISE', 'WISH', 'WITH', 'WOKE', 'WOLF', 'WOMB', 'WOOD', 'WOOL', 'WORD', 'WORE', 'WORK', 'WORM', 'WORN', 'WRAP', 'WREN',
            'YARD', 'YARN', 'YEAH', 'YEAR', 'YELL', 'YOUR',
            'ZEAL', 'ZERO', 'ZEST', 'ZONE', 'ZOOM',
            'ABOUT', 'ABOVE', 'ABUSE', 'ACTED', 'ADDED', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN', 'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE', 'ALLEY', 'ALLOW', 'ALLOY', 'ALONE', 'ALONG', 'ALTER', 'AMONG', 'ANGEL', 'ANGER', 'ANGLE', 'ANGRY', 'ANKLE', 'APART', 'APPLE', 'APPLY', 'ARENA', 'ARGUE', 'ARISE', 'ARMOR', 'AROSE', 'ARRAY', 'ARROW', 'ASIDE', 'ASSET', 'AWARD', 'AWARE', 'AWFUL',
            'BACON', 'BADGE', 'BADLY', 'BASIC', 'BASIN', 'BASIS', 'BATCH', 'BEACH', 'BEARD', 'BEAST', 'BEGAN', 'BEGIN', 'BEGUN', 'BEING', 'BELLY', 'BELOW', 'BENCH', 'BERRY', 'BIRTH', 'BLACK', 'BLADE', 'BLAME', 'BLAND', 'BLANK', 'BLAST', 'BLAZE', 'BLEED', 'BLEND', 'BLESS', 'BLIND', 'BLINK', 'BLOCK', 'BLOND', 'BLOOD', 'BLOOM', 'BLOWN', 'BOARD', 'BOAST', 'BONUS', 'BOOTH', 'BOUND', 'BRAIN', 'BRAND', 'BRASS', 'BRAVE', 'BREAD', 'BREAK', 'BREED', 'BRICK', 'BRIDE', 'BRIEF', 'BRING', 'BROAD', 'BROKE', 'BROOM', 'BROWN', 'BRUSH', 'BUILD', 'BUILT', 'BUNCH', 'BURST', 'BUYER',
            'CABIN', 'CABLE', 'CAMEL', 'CANDY', 'CARGO', 'CARRY', 'CATCH', 'CAUSE', 'CEASE', 'CHAIN', 'CHAIR', 'CHALK', 'CHAMP', 'CHAOS', 'CHARM', 'CHART', 'CHASE', 'CHEAP', 'CHEAT', 'CHECK', 'CHEEK', 'CHEER', 'CHESS', 'CHEST', 'CHICK', 'CHIEF', 'CHILD', 'CHILL', 'CHINA', 'CHOIR', 'CHOKE', 'CHORD', 'CHOSE', 'CHUNK', 'CLAIM', 'CLASH', 'CLASS', 'CLEAN', 'CLEAR', 'CLERK', 'CLICK', 'CLIFF', 'CLIMB', 'CLING', 'CLOCK', 'CLOSE', 'CLOTH', 'CLOUD', 'CLOWN', 'COACH', 'COAST', 'COLOR', 'COUCH', 'COUGH', 'COULD', 'COUNT', 'COURT', 'COVER', 'CRACK', 'CRAFT', 'CRANE', 'CRASH', 'CRAWL', 'CRAZY', 'CREAM', 'CREEK', 'CREEP', 'CREST', 'CRISP', 'CROSS', 'CROWD', 'CROWN', 'CRUDE', 'CRUEL', 'CRUSH', 'CURVE', 'CYCLE',
            'DAILY', 'DAIRY', 'DANCE', 'DEATH', 'DEBUT', 'DECAY', 'DELAY', 'DELTA', 'DENSE', 'DEPOT', 'DEPTH', 'DERBY', 'DESK', 'DIARY', 'DIGIT', 'DIRTY', 'DISCO', 'DITCH', 'DONOR', 'DOUBT', 'DOUGH', 'DOZEN', 'DRAFT', 'DRAIN', 'DRAMA', 'DRANK', 'DRAWN', 'DREAD', 'DREAM', 'DRESS', 'DRIED', 'DRIFT', 'DRILL', 'DRINK', 'DRIVE', 'DROWN', 'DRUNK', 'DYING',
            'EAGER', 'EAGLE', 'EARLY', 'EARTH', 'EATEN', 'EIGHT', 'ELBOW', 'ELDER', 'ELECT', 'ELITE', 'EMBER', 'EMPTY', 'ENDED', 'ENEMY', 'ENJOY', 'ENTER', 'ENTRY', 'EQUAL', 'EQUIP', 'ERASE', 'ERROR', 'ESSAY', 'EVENT', 'EVERY', 'EXACT', 'EXIST', 'EXTRA',
            'FAINT', 'FAIRY', 'FAITH', 'FALSE', 'FANCY', 'FATAL', 'FAULT', 'FAVOR', 'FEAST', 'FENCE', 'FERRY', 'FETAL', 'FEVER', 'FIBER', 'FIELD', 'FIFTH', 'FIFTY', 'FIGHT', 'FINAL', 'FIRST', 'FIXED', 'FLAME', 'FLASH', 'FLEET', 'FLESH', 'FLOAT', 'FLOCK', 'FLOOD', 'FLOOR', 'FLOSS', 'FLOUR', 'FLUID', 'FLUSH', 'FLUTE', 'FOCUS', 'FOGGY', 'FORCE', 'FORGE', 'FORTH', 'FORTY', 'FORUM', 'FOUND', 'FRAME', 'FRANK', 'FRAUD', 'FREAK', 'FRESH', 'FRIED', 'FRONT', 'FROST', 'FRUIT', 'FULLY', 'FUNNY', 'FUZZY',
            'GAMMA', 'GENRE', 'GHOST', 'GIANT', 'GIVEN', 'GIVEN', 'GLARE', 'GLASS', 'GLIDE', 'GLOBE', 'GLORY', 'GLOVE', 'GOOSE', 'GRACE', 'GRADE', 'GRAIN', 'GRAND', 'GRANT', 'GRAPE', 'GRASP', 'GRASS', 'GRAVE', 'GRAVY', 'GREAT', 'GREED', 'GREEN', 'GREET', 'GRIEF', 'GRILL', 'GRIND', 'GROAN', 'GROOM', 'GROSS', 'GROUP', 'GROVE', 'GROWN', 'GUARD', 'GUESS', 'GUEST', 'GUIDE', 'GUILD', 'GUILT', 'GUITAR',
            'HABIT', 'HANDY', 'HAPPY', 'HARSH', 'HASTE', 'HATCH', 'HAUNT', 'HAVEN', 'HEART', 'HEAVY', 'HEDGE', 'HELLO', 'HENCE', 'HINGE', 'HOBBY', 'HONEY', 'HONOR', 'HORSE', 'HOTEL', 'HOUND', 'HOUSE', 'HOVER', 'HUMAN', 'HUMID', 'HUMOR', 'HURRY',
            'IDEAL', 'IMAGE', 'IMPLY', 'INDEX', 'INDIE', 'INNER', 'INPUT', 'ISSUE',
            'JELLY', 'JEWEL', 'JOINT', 'JOKER', 'JOLLY', 'JUDGE', 'JUICE', 'JUICY', 'JUMBO', 'JUMPY',
            'KARMA', 'KAYAK', 'KNIFE', 'KNOCK', 'KNOWN',
            'LABEL', 'LABOR', 'LANCE', 'LARGE', 'LASER', 'LATCH', 'LATER', 'LAUGH', 'LAYER', 'LEARN', 'LEASE', 'LEAST', 'LEAVE', 'LEGAL', 'LEMON', 'LEVEL', 'LEVER', 'LIGHT', 'LIMIT', 'LINEN', 'LIVER', 'LLAMA', 'LOCAL', 'LODGE', 'LOFTY', 'LOGIC', 'LOGIN', 'LONELY', 'LOOSE', 'LOTUS', 'LOUSY', 'LOVED', 'LOVER', 'LOWER', 'LOYAL', 'LUCKY', 'LUNAR', 'LUNCH', 'LYING',
            'MAGIC', 'MAJOR', 'MAKER', 'MANOR', 'MAPLE', 'MARCH', 'MATCH', 'MAYOR', 'MEATY', 'MEDIA', 'MELON', 'MERCY', 'MERGE', 'MERIT', 'MERRY', 'METAL', 'METER', 'MICRO', 'MIGHT', 'MINOR', 'MINUS', 'MIRTH', 'MIXED', 'MIXER', 'MODEL', 'MODEM', 'MONEY', 'MONTH', 'MOOSE', 'MORAL', 'MOTOR', 'MOTTO', 'MOUNT', 'MOUSE', 'MOUTH', 'MOVIE', 'MUDDY', 'MUSIC',
            'NAKED', 'NASTY', 'NAVAL', 'NERVE', 'NEVER', 'NEWLY', 'NIGHT', 'NINTH', 'NOBLE', 'NOISE', 'NOISY', 'NORTH', 'NOTCH', 'NOTED', 'NOVEL', 'NURSE',
            'OCCUR', 'OCEAN', 'OFFER', 'OFTEN', 'OLIVE', 'ONION', 'OPERA', 'ORBIT', 'ORDER', 'OTHER', 'OUGHT', 'OUNCE', 'OUTER', 'OWNED', 'OWNER', 'OXIDE', 'OZONE',
            'PAINT', 'PANEL', 'PANIC', 'PAPER', 'PARTY', 'PASTA', 'PASTE', 'PATCH', 'PAUSE', 'PEACE', 'PEACH', 'PEARL', 'PENNY', 'PERCH', 'PHONE', 'PHOTO', 'PIANO', 'PIECE', 'PILOT', 'PINCH', 'PITCH', 'PIZZA', 'PLACE', 'PLAIN', 'PLANE', 'PLANT', 'PLATE', 'PLAZA', 'PLEAD', 'PLUCK', 'PLUMB', 'POINT', 'POISE', 'POLAR', 'PORCH', 'POUCH', 'POUND', 'POWER', 'PRESS', 'PRICE', 'PRIDE', 'PRIME', 'PRINT', 'PRIOR', 'PRISM', 'PRIZE', 'PROBE', 'PROOF', 'PROSE', 'PROUD', 'PROVE', 'PROXY', 'PUPIL', 'PUPPY', 'PURSE', 'PUSHY',
            'QUACK', 'QUALM', 'QUART', 'QUEEN', 'QUERY', 'QUEST', 'QUEUE', 'QUICK', 'QUIET', 'QUILT', 'QUIRK', 'QUOTA', 'QUOTE',
            'RADAR', 'RADIO', 'RAINY', 'RAISE', 'RALLY', 'RANCH', 'RANGE', 'RAPID', 'RATIO', 'REACH', 'REACT', 'READY', 'REALM', 'REBEL', 'REFER', 'REIGN', 'RELAX', 'RELAY', 'REPLY', 'RESET', 'RIDER', 'RIDGE', 'RIFLE', 'RIGHT', 'RIGID', 'RIPEN', 'RISEN', 'RISKY', 'RIVAL', 'RIVER', 'ROAST', 'ROBOT', 'ROCKY', 'ROGUE', 'ROMAN', 'ROOMY', 'ROOST', 'ROUGH', 'ROUND', 'ROUTE', 'ROYAL', 'RUGBY', 'RULER', 'RURAL',
            'SADLY', 'SAINT', 'SALAD', 'SALON', 'SANDY', 'SAUCE', 'SAUNA', 'SCALE', 'SCARE', 'SCARF', 'SCARY', 'SCENE', 'SCENT', 'SCOPE', 'SCORE', 'SCOUT', 'SCRAP', 'SCREW', 'SEED', 'SEIZE', 'SENSE', 'SERVE', 'SETUP', 'SEVEN', 'SEVER', 'SHADE', 'SHAFT', 'SHAKE', 'SHALL', 'SHAME', 'SHAPE', 'SHARE', 'SHARK', 'SHARP', 'SHAVE', 'SHEEP', 'SHEER', 'SHEET', 'SHELF', 'SHELL', 'SHIFT', 'SHINE', 'SHINY', 'SHIRT', 'SHOCK', 'SHORE', 'SHORT', 'SHOUT', 'SHOVE', 'SHOWN', 'SHRUB', 'SHRUG', 'SIGHT', 'SIGMA', 'SILLY', 'SINCE', 'SIXTH', 'SIXTY', 'SIZED', 'SKILL', 'SKULL', 'SLANG', 'SLASH', 'SLATE', 'SLAVE', 'SLEEK', 'SLEEP', 'SLICE', 'SLIDE', 'SLOPE', 'SMALL', 'SMART', 'SMELL', 'SMILE', 'SMOKE', 'SNACK', 'SNAKE', 'SNEAK', 'SOLAR', 'SOLID', 'SOLVE', 'SONIC', 'SORRY', 'SOUND', 'SOUTH', 'SPACE', 'SPARE', 'SPARK', 'SPAWN', 'SPEAK', 'SPEAR', 'SPEED', 'SPELL', 'SPEND', 'SPENT', 'SPICE', 'SPICY', 'SPINE', 'SPITE', 'SPLIT', 'SPOKE', 'SPOON', 'SPORT', 'SPRAY', 'SQUAD', 'STACK', 'STAFF', 'STAGE', 'STAIN', 'STAIR', 'STAKE', 'STALE', 'STAMP', 'STAND', 'STARK', 'START', 'STATE', 'STEAK', 'STEAL', 'STEAM', 'STEEL', 'STEEP', 'STEER', 'STERN', 'STICK', 'STIFF', 'STILL', 'STING', 'STINK', 'STOCK', 'STOMP', 'STONE', 'STOOD', 'STOOL', 'STORE', 'STORM', 'STORY', 'STOUT', 'STOVE', 'STRAP', 'STRAW', 'STRAY', 'STRIP', 'STUCK', 'STUDY', 'STUFF', 'STUNG', 'STUNK', 'STYLE', 'SUGAR', 'SUITE', 'SUNNY', 'SUPER', 'SURGE', 'SWAMP', 'SWARM', 'SWEAR', 'SWEAT', 'SWEEP', 'SWEET', 'SWIFT', 'SWING', 'SWISS', 'SWORD', 'SWORE', 'SWORN',
            'TABLE', 'TAKEN', 'TASTY', 'TEACH', 'TEETH', 'TEMPO', 'TENSE', 'TENTH', 'TERMS', 'THANK', 'THEFT', 'THEIR', 'THEME', 'THERE', 'THESE', 'THICK', 'THIEF', 'THIGH', 'THING', 'THINK', 'THIRD', 'THORN', 'THOSE', 'THREE', 'THREW', 'THROW', 'THUMB', 'TIGER', 'TIGHT', 'TIMER', 'TIRED', 'TITLE', 'TODAY', 'TOKEN', 'TOOTH', 'TOPIC', 'TORCH', 'TOTAL', 'TOUCH', 'TOUGH', 'TOWER', 'TOXIC', 'TRACE', 'TRACK', 'TRADE', 'TRAIL', 'TRAIN', 'TRAIT', 'TRASH', 'TREAT', 'TREND', 'TRIAL', 'TRIBE', 'TRICK', 'TRIED', 'TROOP', 'TRULY', 'TRUNK', 'TRUST', 'TRUTH', 'TUMOR', 'TUNER', 'TURBO', 'TUTOR', 'TWEET', 'TWICE', 'TWIST', 'TYPED',
            'ULTRA', 'UNCLE', 'UNDER', 'UNFAIR', 'UNION', 'UNITE', 'UNITY', 'UNTIL', 'UPPER', 'UPSET', 'URBAN', 'USHER', 'USUAL',
            'VAGUE', 'VALID', 'VALUE', 'VALVE', 'VAULT', 'VENUE', 'VERSE', 'VIDEO', 'VIGOR', 'VIRAL', 'VIRUS', 'VISIT', 'VITAL', 'VIVID', 'VOCAL', 'VODKA', 'VOGUE', 'VOICE', 'VOTER',
            'WAGON', 'WAIST', 'WASTE', 'WATCH', 'WATER', 'WAVED', 'WAXEN', 'WEARY', 'WEDGE', 'WEIGH', 'WEIRD', 'WHALE', 'WHEAT', 'WHEEL', 'WHERE', 'WHICH', 'WHILE', 'WHITE', 'WHOLE', 'WHOSE', 'WIDTH', 'WITCH', 'WOMAN', 'WOMEN', 'WOODS', 'WOODY', 'WORLD', 'WORRY', 'WORSE', 'WORST', 'WORTH', 'WOULD', 'WOUND', 'WOVEN', 'WRECK', 'WRIST', 'WRITE', 'WRONG', 'WROTE',
            'YACHT', 'YEARN', 'YEAST', 'YIELD', 'YOUNG', 'YOURS', 'YOUTH',
            'ZEBRA', 'ZESTY', 'ZIPPY', 'ZOMBI', 'ZONAL'
        ];

        wordSet = new Set(commonWords.map(w => w.toUpperCase()));
        isLoaded = true;
        console.log(`Fallback dictionary loaded: ${wordSet.size} words`);
    }

    // Check if a word is valid
    function isValidWord(word) {
        if (!isLoaded) {
            console.warn('Dictionary not loaded yet');
            return false;
        }
        return wordSet.has(word.toUpperCase());
    }

    // Get all valid words from an array
    function filterValidWords(words) {
        return words.filter(word => isValidWord(word));
    }

    // Check if dictionary is ready
    function isReady() {
        return isLoaded;
    }

    return {
        load,
        isValidWord,
        filterValidWords,
        isReady
    };
})();
