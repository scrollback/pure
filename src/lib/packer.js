/* @flow */

import Know from '../submodules/know/lib/Cache';
import EnhancedError from './EnhancedError';
import * as models from '../models/models';
import stringPack from 'stringpack';

const packerArg = Object.keys(models).sort().map(key => models[key]);

packerArg.push(EnhancedError);
packerArg.push(Know.RangeArray);
packerArg.push(Know.OrderedArray);

const packer = stringPack(packerArg);

export default packer;
