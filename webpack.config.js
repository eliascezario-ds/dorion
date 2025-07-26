import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: "development",
  entry: {
    code: "./src/code.js",
    ui: "./src/screens/features/ui.mjs",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".mjs", ".js", ".json"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "ui.html",
      template: "./src/screens/features/ui.html",
      chunks: ["ui"],
    }),
    new CopyPlugin({
      patterns: [
        { from: "./manifest.json", to: "manifest.json" },
      ],
    }),
  ],
};
