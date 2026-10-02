import { validatePreset } from './engine.js';

const sharedFirstNames = {
  masc: ['Alden', 'Cassian', 'Darius', 'Emrys', 'Ivo', 'Lucan', 'Orion', 'Soren'],
  femme: ['Amara', 'Celeste', 'Ilyra', 'Maren', 'Nadia', 'Seraphine', 'Talia', 'Vesper'],
  neither: ['Ash', 'Briar', 'Echo', 'Lark', 'Quinn', 'Ren', 'Sage', 'Vale'],
};

const pronouns = ['she/her', 'he/him', 'they/them', 'custom'];
const field = (id, label, generator, extra = {}) => ({ id, label, generator, type: 'select', ...extra });
const section = (id, title, fields, description) => ({ id, title, fields, description });

export const PRESETS = [
  {
    id: 'high-fantasy', name: 'High Fantasy', eyebrow: 'Oaths, wonders, and old roads',
    names: { first: sharedFirstNames, last: { type: 'compound', prefixes: ['Amber', 'Dawn', 'Moon', 'Raven', 'Silver', 'Thorn'], suffixes: ['bloom', 'fall', 'mere', 'song', 'ward', 'wood'] } },
    pools: {
      pronouns, ancestry: ['Human', 'Elf', 'Dwarf', 'Orc', 'Halfling', 'Tiefling', 'River-folk'],
      calling: ['Wandering healer', 'Relic seeker', 'Court envoy', 'Monster chronicler', 'Hedge witch', 'Disgraced knight'],
      feature: ['constellation freckles', 'a silver prosthetic hand', 'antler-like horns', 'eyes bright as forge sparks', 'ritual tattoos', 'a voice that carries strangely'],
      clothing: ['embroidered traveling coat', 'practical leathers with bright ribbons', 'layered silk and mail', 'weathered robes full of pockets', 'formal tunic with a family crest'],
      temperament: ['warmly curious', 'ceremonial and precise', 'mischievous under pressure', 'quietly defiant', 'earnest to a fault'],
      ideal: ['mercy should outlive victory', 'knowledge belongs to everyone', 'promises make a person', 'no throne is sacred', 'wonder is worth the risk'],
      origin: ['a library carved into a cliff', 'a border village erased from maps', 'a city built around a sleeping dragon', 'a pilgrim caravan', 'an orchard haunted by kind ghosts'],
      secret: ['their magic answers to an unknown name', 'they carry a letter from the future', 'their family serves the antagonist', 'they once spared a terrible creature', 'their title belongs to someone else'],
      bond: ['a rival who keeps saving them', 'a sibling searching for the same relic', 'an elderly griffin', 'a revolutionary printer', 'the ghost of their first teacher'],
    },
    sections: [
      section('identity', 'Identity', [field('firstName', 'First name', 'firstName'), field('lastName', 'Last name', 'lastName'), field('pronouns', 'Pronouns', 'pronouns'), field('ancestry', 'Ancestry', 'ancestry')]),
      section('path', 'Path & Purpose', [field('calling', 'Calling', 'calling'), field('ideal', 'Guiding ideal', 'ideal'), field('origin', 'Origin', 'origin')]),
      section('presence', 'Presence', [field('feature', 'Striking feature', 'feature'), field('clothing', 'Clothing', 'clothing', { dependsOn: ['pronouns'], hints: [{ field: 'pronouns', equals: 'she/her', prefer: ['embroidered traveling coat', 'layered silk and mail'], weight: 2 }] }), field('temperament', 'Temperament', 'temperament')]),
      section('threads', 'Story Threads', [field('bond', 'Important bond', 'bond'), field('secret', 'Complication', 'secret')]),
    ],
  },
  {
    id: 'vampire', name: 'Vampire', eyebrow: 'Hunger, intimacy, and the long night',
    names: { first: sharedFirstNames, last: { type: 'pattern', roots: ['Ash', 'Bell', 'Corvin', 'Delacroix', 'Morrow', 'Nocturne'], patterns: ['{root}', 'de {root}', '{root} House', '{root}-Saint'] } },
    pools: {
      pronouns, era: ['newly turned', 'a century undead', 'Victorian survivor', 'ancient and recently awakened', 'former hunter'],
      hunger: ['beautiful memories', 'artists at the moment of inspiration', 'betrayal', 'the blood of liars', 'people who invite danger'],
      gift: ['walking through mirrors', 'commanding moths', 'stealing a voice', 'dream visitation', 'perfect mimicry'],
      bane: ['church bells', 'being photographed', 'running water', 'a spoken childhood name', 'unreturned affection'],
      look: ['immaculate funeral tailoring', 'soft clubwear and antique jewelry', 'a raincoat from another decade', 'romantic lace over practical boots', 'minimal black with one vivid accent'],
      mask: ['night-shift archivist', 'underground musician', 'grief counselor', 'rare-book dealer', 'tenant advocate'],
      desire: ['to feel surprise again', 'to protect their mortal descendants', 'to destroy their maker', 'to become human for one dawn', 'to be remembered kindly'],
      tie: ['a mortal who knows the truth', 'the vampire who abandoned them', 'a hunter with a truce', 'a coven that calls them traitor', 'an immortal pen pal'],
    },
    sections: [
      section('identity', 'The Name They Keep', [field('firstName', 'First name', 'firstName'), field('lastName', 'Last name', 'lastName'), field('pronouns', 'Pronouns', 'pronouns'), field('era', 'Undead age', 'era')]),
      section('curse', 'The Curse', [field('hunger', 'Particular hunger', 'hunger'), field('gift', 'Dark gift', 'gift'), field('bane', 'Private bane', 'bane')]),
      section('mortal', 'Mortal Life', [field('mask', 'Modern cover', 'mask'), field('look', 'Nightly look', 'look', { dependsOn: ['pronouns'], hints: [{ field: 'pronouns', equals: 'they/them', prefer: ['soft clubwear and antique jewelry', 'minimal black with one vivid accent'], weight: 3 }] })]),
      section('heart', 'What Remains', [field('desire', 'Secret desire', 'desire'), field('tie', 'Entanglement', 'tie')]),
    ],
  },
  {
    id: 'magical-girl', name: 'Magical Girl', eyebrow: 'Bright transformation, tender stakes',
    names: { first: { masc: ['Akio', 'Haru', 'Jun', 'Ren', 'Sora', 'Yuto'], femme: ['Aiko', 'Emi', 'Hana', 'Mei', 'Reina', 'Yuki'], neither: ['Aki', 'Hikari', 'Kaoru', 'Michi', 'Nao', 'Rin'] }, last: { type: 'complete', values: ['Amari', 'Hayashi', 'Moon', 'Okafor', 'Sato', 'Serrano', 'Tanaka', 'Vale'] } },
    pools: {
      pronouns, life: ['astronomy club president', 'bakery assistant', 'quiet transfer student', 'roller derby rookie', 'community radio host', 'overcommitted class representative'],
      theme: ['comets', 'roses and thorns', 'deep-sea light', 'mirrors', 'summer storms', 'paper cranes'],
      item: ['a compact with a cracked star', 'an enamel fountain pen', 'a charm bracelet', 'headphones that catch wishes', 'a folding fan', 'a battered instant camera'],
      costume: ['a sharp sailor silhouette with a long cape', 'layered ribbons and armored boots', 'a constellation jacket over a luminous skirt', 'a tailored suit edged in rose-gold light', 'soft translucent layers that move like water'],
      power: ['turning regret into shields', 'drawing paths through impossible spaces', 'healing through shared memories', 'summoning luminous familiars', 'making spoken promises briefly real'],
      familiar: ['a bossy moon rabbit', 'a shy mechanical koi', 'a crow who loves gossip', 'a tiny lion made of clouds', 'a sleepy ghost cat'],
      pressure: ['their grades are collapsing', 'their best friend suspects everything', 'their family is moving away', 'the enemy knows their civilian name', 'their powers are changing without permission'],
      hope: ['everyone deserves a second transformation', 'loneliness can be interrupted', 'anger can protect what love reveals', 'joy is a form of resistance', 'the future is made together'],
    },
    sections: [
      section('identity', 'Everyday Self', [field('firstName', 'First name', 'firstName'), field('lastName', 'Last name', 'lastName'), field('pronouns', 'Pronouns', 'pronouns'), field('life', 'Mortal life', 'life')]),
      section('magic', 'Magical Identity', [field('theme', 'Transformation theme', 'theme'), field('item', 'Transformation item', 'item'), field('power', 'Signature power', 'power')]),
      section('transformation', 'Transformation', [field('costume', 'Costume', 'costume', { dependsOn: ['pronouns'], hints: [{ field: 'pronouns', equals: 'he/him', prefer: ['a tailored suit edged in rose-gold light', 'a sharp sailor silhouette with a long cape'], weight: 3 }] }), field('familiar', 'Companion', 'familiar')]),
      section('heart', 'Heart on the Line', [field('hope', 'Core belief', 'hope'), field('pressure', 'Everyday pressure', 'pressure')]),
    ],
  },
  {
    id: 'space', name: 'Space', eyebrow: 'Found family at the edge of the chart',
    names: { first: { masc: ['Cass', 'Dax', 'Ishan', 'Lev', 'Omar', 'Tao'], femme: ['Anika', 'Juno', 'Lian', 'Nia', 'Rhea', 'Zara'], neither: ['Ari', 'Kit', 'Lux', 'Nova', 'Sol', 'Vey'] }, last: { type: 'complete', values: ['Adebayo', 'Chen', 'Kestrel', 'Navarro', 'Orlov', 'Quill', 'Sato', 'Venn'] } },
    pools: {
      pronouns, origin: ['orbital garden habitat', 'generation ship', 'storm moon refinery', 'ocean world embassy', 'independent salvage flotilla', 'corporate arcology'],
      role: ['xenolinguist', 'salvage pilot', 'ship medic', 'memory cartographer', 'union organizer', 'terraforming ecologist'],
      augment: ['a translation implant with opinions', 'vacuum-adapted lungs', 'a modular prosthetic spine', 'bioluminescent interface marks', 'a swarm of repair nanites'],
      style: ['patched flight suit covered in mission pins', 'sleek pressurewear under a dramatic coat', 'soft habitat knits and magnetic jewelry', 'corporate uniform carefully subverted', 'antique Earth fashion rebuilt from smart fabric'],
      edge: ['can hear structural stress in a hull', 'never gets lost in three dimensions', 'knows every port rumor', 'can make obsolete machines cooperate', 'remembers alien songs after one hearing'],
      trouble: ['owes a favor to a station intelligence', 'is legally dead in three systems', 'smuggled something that is now awake', 'deserted from a celebrated expedition', 'carries a map nobody should possess'],
      connection: ['a ship captain who gave them a home', 'their clone-sibling on the other side of a war', 'a distant research collective', 'an ex-partner who runs customs', 'a child they mentor by tightbeam'],
      wonder: ['the first sunrise on a terraformed world', 'a living nebula', 'messages from beyond the mapped gates', 'an archive encoded in whale song', 'a planet-sized abandoned instrument'],
    },
    sections: [
      section('identity', 'Identity', [field('firstName', 'First name', 'firstName'), field('lastName', 'Last name', 'lastName'), field('pronouns', 'Pronouns', 'pronouns'), field('origin', 'Place of origin', 'origin')]),
      section('career', 'Crew Role', [field('role', 'Specialty', 'role'), field('edge', 'Unfair advantage', 'edge')]),
      section('body', 'Future Self', [field('augment', 'Augmentation', 'augment'), field('style', 'Field style', 'style', { dependsOn: ['pronouns'], hints: [{ field: 'pronouns', equals: 'she/her', prefer: ['sleek pressurewear under a dramatic coat', 'antique Earth fashion rebuilt from smart fabric'], weight: 2 }] })]),
      section('trajectory', 'Trajectory', [field('connection', 'Long-distance connection', 'connection'), field('trouble', 'Complication', 'trouble'), field('wonder', 'Wonder they seek', 'wonder')]),
    ],
  },
].map(validatePreset);

export const PRESET_BY_ID = Object.fromEntries(PRESETS.map((preset) => [preset.id, preset]));
