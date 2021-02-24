function TimingCompilationPlugin(options) {}

let t0 = new Date();

TimingCompilationPlugin.prototype.apply = function(compiler) {
  compiler.hooks.beforeCompile.tap('compile', async (init) => {
    t0 = new Date();
    return init;
  });

  compiler.hooks.afterCompile.tap('done', async (done) => {
    const diff = new Date().valueOf() - t0.valueOf();
    console.log(`[Compilation time: ${diff}ms]`);
    return done;
  });
};

module.exports = TimingCompilationPlugin;
