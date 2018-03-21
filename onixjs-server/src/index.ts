const config = require('../onix.config.json');
import { HostBoot } from '@onixjs/core';
// Create a new HostBoot instance for our OnixJS Config
const boot: HostBoot = new HostBoot(config);
// Run our OnixJS Context
boot.run();