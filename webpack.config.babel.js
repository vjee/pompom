import { join } from "path"

const env = process.env.NODE_ENV || "production"

const exclude = /node_modules/
const include = join(__dirname, "src")

const config = {
  mode: env,

  entry: "./src/index",

  output: {
    path: join(__dirname, "dist"),
    libraryTarget: "umd",
    library: "pompom",
  },

  devtool: "source-map",

  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
        },
        exclude,
        include,
      },
    ],
  },

  plugins: [],
}

export default config
