/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  ScrollView,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import {virgilCrypto} from 'react-native-virgil-crypto';
import {encryptSignAndUploadImage} from './encryptSignAndUpload';
import {downloadVerifyAndDecryptImage} from './downloadVerifyAndDecrypt';

const apiUrl = `http://${
  Platform.OS === 'android' ? '10.0.2.2' : 'localhost'
}:3000`;
const keypair = virgilCrypto.generateKeys();

const getFileExtension = filename => {
  let i = filename.lastIndexOf('.');
  return i > 0 ? filename.substr(i + 1) : null;
};

export default class App extends Component {
  state = {
    uploadedImage: undefined,
    imageIdToDownload: undefined,
    downloadedImage: undefined,
    error: undefined,
  };

  pickImage = () => {
    return new Promise((resolve, reject) => {
      const options = {
        title: 'Select image to upload',
        storageOptions: {
          skipBackup: true,
          waitUntilSaved: true,
        },
        quality: 1,
      };
      ImagePicker.showImagePicker(options, response => {
        if (response.didCancel) {
          return resolve(null);
        }

        if (response.error) {
          console.log('ImagePicker Error: ', response.error);
          return reject(response.error);
        }

        const {data, ...image} = response;

        resolve(image);
      });
    });
  };

  handleUpload = () => {
    this.reset();
    this.pickImage()
      .then(image =>
        encryptSignAndUploadImage({image, keypair, url: `${apiUrl}/upload`}),
      )
      .then(result => {
        if (result) {
          const {id, ...image} = result;
          this.setState({
            uploadedImage: image,
            imageIdToDownload: id,
          });
        }
      })
      .catch(err => {
        console.log('Error while uploading: ', err);
        this.setState({error: err.toString()});
      });
  };

  handleDownload = () => {
    downloadVerifyAndDecryptImage({
      url: `${apiUrl}/upload/${this.state.imageIdToDownload}`,
      keypair,
      extension: getFileExtension(this.state.uploadedImage.fileName),
    })
      .then(image => {
        this.setState({downloadedImage: image});
      })
      .catch(err => {
        console.log('Error while downloading: ', err);
        this.setState({error: err.toString()});
      });
  };

  reset = () => {
    this.setState({
      uploadedImage: null,
      imageIdToDownload: null,
      downloadedImage: null,
      error: null,
    });
  };

  renderUploadedImage = () => {
    const {uploadedImage} = this.state;
    if (!uploadedImage) {
      return null;
    }

    return this.renderObject(uploadedImage);
  };

  renderDownloadedImage = () => {
    const {downloadedImage} = this.state;
    if (!downloadedImage) {
      return null;
    }

    if (!downloadedImage.isSigantureVerified) {
      return (
        <Text style={styles.error}>
          The downloaded image cannot be displayed because its digital signature
          failed verification
        </Text>
      );
    }

    return this.renderImage(downloadedImage);
  };

  renderObject(p) {
    function objectToText(obj, indent = 0) {
      return Object.keys(obj)
        .map(k => {
          if (typeof obj[k] === 'object') {
            return objectToText(obj[k], indent + 4);
          }
          return `${' '.repeat(indent)}${k}: ${obj[k]}`;
        })
        .flat();
    }

    let text = objectToText(p);
    return (
      <View>
        {text.map((t, i) => (
          <Text key={i} style={styles.json}>
            {t}
          </Text>
        ))}
      </View>
    );
  }

  renderImage(p) {
    return (
      <Image style={{height: 320}} resizeMode="contain" source={{uri: p.uri}} />
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.section}>
            <Button
              style={styles.button}
              title="Pick an image to upload"
              onPress={this.handleUpload}
            />
            {this.renderUploadedImage()}
          </View>
          <View style={styles.section}>
            {this.state.imageIdToDownload && (
              <Button
                style={styles.button}
                title="Download and display"
                onPress={this.handleDownload}
              />
            )}
            {this.renderDownloadedImage()}
          </View>
          <View style={styles.section}>
            {this.state.error && (
              <Text style={styles.error}>{this.state.error}</Text>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
    marginTop: 100,
    paddingLeft: 20,
    paddingRight: 20,
  },
  section: {
    marginBottom: 20,
  },
  button: {
    marginBottom: 20,
  },
  json: {
    fontFamily: 'Menlo',
    fontSize: 11,
    textAlign: 'left',
  },
  error: {
    color: 'red',
  },
});
