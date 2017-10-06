#!/usr/bin/env node

const distBuilder = require('.')
const fs = require('fs')
const isEqual = require('lodash/isEqual')
const program = require('commander')

function currentModuleVersions () {
  const modules = distBuilder.availableModules()

  modules.distBuilder = distBuilder.distBuilderInfo()

  return Object.keys(modules).reduce((versions, name) => {
    versions[modules[name].module] = modules[name].version

    return versions
  }, {})
}

function compareModuleVersions (lastVersionsPath, versions) {
  const last = JSON.parse(fs.readFileSync(lastVersionsPath))

  return isEqual(last, versions || currentModuleVersions())
}

function upgradeVersion (lastVersionsPath, versionFilePath) {
  let change = false
  let patchVersion = -1

  try {
    patchVersion = parseInt(fs.readFileSync(versionFilePath))
  } catch (e) {
    change = true
  }

  const current = currentModuleVersions()

  change = change || !compareModuleVersions(lastVersionsPath, current)

  if (change) {
    patchVersion++

    fs.writeFileSync(lastVersionsPath, JSON.stringify(current, null, ' '))
    fs.writeFileSync(versionFilePath, patchVersion.toString())
  }

  return change
}

function currentVersion (versionFilePath) {
  const patchVersion = parseInt(fs.readFileSync(versionFilePath))
  const packageInfo = distBuilder.distBuilderInfo()

  return packageInfo.version.split('.').slice(0, 2).join('.') + '.' + patchVersion
}

program
  .command('modules-dump')
  .action(() => {
    process.stdout.write(JSON.stringify(currentModuleVersions(), null, ' '))
  })

program
  .command('modules-compare <lastVersions>')
  .action((lastVersions) => {
    process.exit(compareModuleVersions(lastVersions) ? 0 : 1)
  })

program
  .command('upgrade <lastVersions> <versionFile>')
  .action((lastVersions, versionFile) => {
    process.exit(upgradeVersion(lastVersions, versionFile) ? 1 : 0)
  })

program
  .command('version <versionFile>')
  .action((versionFile) => {
    process.stdout.write(currentVersion(versionFile))
  })

program.parse(process.argv)
