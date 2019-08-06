#! /usr/bin/env node
const fs = require('fs')
const program = require('commander') //终端输入处理框架
const download = require('download-git-repo') // 拉取github上的文件。
const chalk = require('chalk') // 改变输出文字的颜色
var inquirer = require('inquirer') //提示文本
const ora = require('ora') // 小图标（loading、succeed、warn等
const package = require('./package.json') //获取版本信息
const symbols = require('log-symbols') //美化终端
const re = new RegExp('^[a-zA-Z-]+$') //检查文件名是否是英文，只支持英文
const handlebars = require('handlebars') //修改模版文件内容
const shell = require('shelljs')

/**
 * 模版对应分支
 */
const getType = {
  'modal.js': 'common-modal',
  'list.js': 'common-list'
}

shell.exec('pwd', function(err, nowPath) {
  if (err) {
    return
  }
  const pwdPath = nowPath.replace(/\s+/g, '')
  program
    .version(package.version, '-v,--version')
    .option('-i, init [name]', '初始化  项目')
    .option('-c create [name]')
    .parse(process.argv)

  if (program.init) {
    const name = program.init
    if (!re.test(name)) {
      //检查文件名是否是英文
      console.log(symbols.error, chalk.red('错误!请输入英文名称'))
      return
    }
    if (!fs.existsSync(name)) {
      //检查项目中是否有该文件
      console.log(symbols.success, chalk.green('开始创建..........,请稍候'))
      const spinner = ora('正在下载模板...')
      spinner.start()
      download(`dengnan123/daily_temp`, name, err => {
        if (err) {
          spinner.fail()
        } else {
          spinner.succeed()
          console.log(symbols.success, chalk.green('模版创建成功'))
        }
      })
    } else {
      console.log(symbols.error, chalk.red('有相同名称模版'))
    }
  }

  if (program.create) {
    const name = program.create
    // const pathArr = program.args
    const namePath = `${pwdPath}/${name}`
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'type',
          message: '请选择模版类型?',
          choices: ['modal.js', 'list.js']
        }
      ])
      .then(answers => {
        console.log(symbols.success, chalk.green('开始创建..........,请稍候'))
        const spinner = ora('正在下载模板...')
        spinner.start()
        const modalType = answers.type
        const type = getType[modalType]
        if (!fs.existsSync(namePath)) {
          download(`dengnan123/daily_temp/#${type}`, name, err => {
            if (err) {
              spinner.fail()
              console.log(symbols.error, chalk.red('下载失败'))
              return
            }
            spinner.succeed()
            console.log(symbols.success, chalk.green('模版创建成功'))
          })
        } else {
          const filePath = `${namePath}/${modalType}`
          if (fs.existsSync(filePath)) {
            console.log(`模板${modalType}>>>>>>在路径${pwdPath}下面已存在`)
            spinner.fail()
            console.log(symbols.error, chalk.red('下载失败'))
            return
          }
          download(`dengnan123/daily_temp/#${type}`, name, err => {
            if (err) {
              spinner.fail()
              console.log(symbols.error, chalk.red('下载失败'))
              console.log(err)
              return
            }
            spinner.succeed()
            console.log(symbols.success, chalk.green('模版创建成功'))
          })
        }
      })
  }
})
