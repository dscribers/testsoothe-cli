#!/usr/bin/env node

import 'regenerator-runtime/runtime'
import program from 'commander'
import { version } from '../../package.json'
import ping from '../commands/ping'
import auth from '../commands/auth'
import projects from '../commands/projects'
import features from '../commands/features'
import scenarios from '../commands/scenarios'
import flows from '../commands/flows'
import selections from '../commands/selections'
import key from '../commands/key'
import test from '../commands/test'

require('dotenv').config()

program.version(version)

ping(program)
auth(program)
projects(program)
features(program)
scenarios(program)
flows(program)
selections(program)
key(program)
test(program)

program.parse(process.argv)
