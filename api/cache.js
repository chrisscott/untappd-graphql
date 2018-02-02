import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60 * 60 * 24 }); // default TTL to one day

export default cache;
