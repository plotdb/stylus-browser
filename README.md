# stylus-browser

browserify stylus, with minimized js file sized 286KB.


## Size comparison

 - [bundle file](https://stylus-lang.com/try/stylus.min.js) from [stylus-lang.com](https://stylus-lang.com): < 200KB ( 0.54.5 )
 - bundle from [stylus-lang-bundle](https://github.com/openstyles/stylus-lang-bundle): < 200KB ( 0.54.7 )
   - somehow failed to rebuild with latest dev.
   - fs shimmed.
 - our bundle: 286KB ( 0.57.0 )

bundle components analysis is available under `web/static/discify/index.html`.


## License

MIT License.

 - this repo is released under MIT License
 - Stylus itself is released under MIT License.
 - Some shims used in this repo are adopted from [openstyles/stylus-lang-bundle](https://github.com/openstyles/stylus-lang-bundle), which are released under MIT license.



