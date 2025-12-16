module.exports = {
  env: {
    browser: false,
    es2021: true,
    node: true,
    mocha: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    // 错误级别
    'no-console': 'off', // 在服务器应用中允许使用console
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // 允许使用下划线开头的未使用变量
    
    // 代码风格
    'indent': ['error', 2], // 2空格缩进
    'linebreak-style': ['error', 'unix'], // Unix换行符
    'quotes': ['error', 'single'], // 单引号
    'semi': ['error', 'always'], // 总是使用分号
    
    // 最佳实践
    'eqeqeq': 'error', // 使用 === 和 !==
    'no-eval': 'error', // 禁用eval
    'no-implied-eval': 'error', // 禁用隐式eval
    'no-new-func': 'error', // 禁用Function构造函数
    'no-return-assign': 'error', // 禁止在return语句中赋值
    'no-self-compare': 'error', // 禁止自我比较
    'no-throw-literal': 'error', // 只允许抛出Error对象
    'no-unmodified-loop-condition': 'error', // 禁止在循环条件中修改值
    'radix': 'error', // 在parseInt中使用基数
    
    // Node.js最佳实践
    'no-process-exit': 'off', // 在某些情况下需要使用process.exit
    'global-require': 'off', // 在某些情况下需要使用require
    
    // 异步处理
    'require-await': 'error', // async函数中必须有await
    'no-promise-executor-return': 'error', // 禁止在promise executor中返回值
  },
  overrides: [
    {
      files: ['test/**/*.js', '**/*.test.js', '**/*.spec.js'],
      env: {
        mocha: true,
      },
      rules: {
        'no-unused-vars': 'off', // 测试文件中可能有未使用的变量
      },
    },
  ],
};