const path = require("path");

const {
  promises: { readdir },
} = require("fs");

const routeObjectOfFile = function (dirent, source, prefix) {
  const pathObject = path.parse(path.resolve(source, dirent.name));

  const pathRouter = () => {
    if (path.basename(source) === "pages") {
      return pathObject.name === "index"
        ? `/${prefix}`
        : `/${prefix}/${pathObject.name.replace("_", ":")}`;
    }

    return pathObject.name === "index"
      ? `/${prefix}/${path.basename(source)}`
      : `/${prefix}/${path.basename(source)}/${pathObject.name.replace(
          "_",
          ":"
        )}`;
  };

  const nameRouter = () => {
    if (path.basename(source) === "pages") {
      return pathObject.name === "index"
        ? prefix
        : `${prefix}-${pathObject.name.replace("_", "")}`;
    }

    return pathObject.name === "index"
      ? `${prefix}-${path.basename(source)}`
      : `${prefix}-${path.basename(source)}-${pathObject.name.replace(
          "_",
          ""
        )}`;
  };

  return {
    name: nameRouter(),
    path: pathRouter(),
    component: `${source}/${pathObject.base}`,
  };
};

const getRouteObjectOfFile = async (source, prefix) => {
  const files = await readdir(source, { withFileTypes: true });

  const arrayPromise = files.map(async (dirent) => {
    if (dirent.isDirectory()) {
      console.log(dirent.name, path.resolve(source, dirent.name));
      return Promise.all(
        await getRouteObjectOfFile(path.resolve(source, dirent.name), prefix)
      );
    }

    return routeObjectOfFile(dirent, source, prefix);
  });

  return Promise.all(arrayPromise);
};

module.exports = function registerModule(moduleOptions) {
  this.nuxt.hook("components:dirs", (dirs) => {
    dirs.push({
      path: path.resolve(__dirname, "components"),
    });
  });

  this.extendRoutes(async (routes) => {
    const listRoutes = await getRouteObjectOfFile(
      path.join(__dirname, "pages"),
      "blog"
    );

    console.log("listRoutes", listRoutes);

    // listRoutes.forEach((route) => routes.unshift(route));
  });

  this.addPlugin(path.resolve(__dirname, "store/blog.js"));
};
