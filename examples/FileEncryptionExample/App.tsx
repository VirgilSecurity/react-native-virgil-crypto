import React, {useCallback, useState} from 'react';
import {
  Button,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {launchImageLibrary, type Asset} from 'react-native-image-picker';
import {virgilCrypto} from 'react-native-virgil-crypto';

import {encryptSignAndUploadImage} from './encryptSignAndUpload';
import {downloadVerifyAndDecryptImage} from './downloadVerifyAndDecrypt';

const apiUrl = `http://${
  Platform.OS === 'android' ? '10.0.2.2' : 'localhost'
}:3000`;

const keypair = virgilCrypto.generateKeys();

const getFileExtension = (filename: string | undefined): string | null => {
  if (!filename) {
    return null;
  }
  const i = filename.lastIndexOf('.');
  return i > 0 ? filename.slice(i + 1) : null;
};

type UploadedImage = Asset & {id: string; signature: string};

type DownloadedImage = {
  signature: string;
  isSignatureVerified: boolean;
  uri?: string;
};

const pickImage = async (): Promise<Asset | null> => {
  const result = await launchImageLibrary({mediaType: 'photo', quality: 1});
  if (result.didCancel) {
    return null;
  }
  if (result.errorCode) {
    console.log('ImagePicker Error: ', result.errorMessage);
    throw new Error(result.errorMessage ?? result.errorCode);
  }
  return result.assets?.[0] ?? null;
};

function App(): React.JSX.Element {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(
    null,
  );
  const [downloadedImage, setDownloadedImage] =
    useState<DownloadedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setUploadedImage(null);
    setDownloadedImage(null);
    setError(null);
  };

  const handleUpload = useCallback(async () => {
    reset();
    try {
      const image = await pickImage();
      const result = await encryptSignAndUploadImage({
        image,
        keypair,
        url: `${apiUrl}/upload`,
      });
      if (result) {
        setUploadedImage(result);
      }
    } catch (err) {
      console.log('Error while uploading: ', err);
      setError(String(err));
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!uploadedImage) {
      return;
    }
    try {
      const image = await downloadVerifyAndDecryptImage({
        url: `${apiUrl}/upload/${uploadedImage.id}`,
        keypair,
        extension: getFileExtension(uploadedImage.fileName),
      });
      setDownloadedImage(image);
    } catch (err) {
      console.log('Error while downloading: ', err);
      setError(String(err));
    }
  }, [uploadedImage]);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Button title="Pick an image to upload" onPress={handleUpload} />
          {uploadedImage && <ObjectView value={uploadedImage} />}
        </View>
        <View style={styles.section}>
          {uploadedImage && (
            <Button title="Download and display" onPress={handleDownload} />
          )}
          {downloadedImage &&
            (downloadedImage.isSignatureVerified ? (
              downloadedImage.uri ? (
                <Image
                  style={styles.image}
                  resizeMode="contain"
                  source={{uri: downloadedImage.uri}}
                />
              ) : null
            ) : (
              <Text style={styles.error}>
                The downloaded image cannot be displayed because its digital
                signature failed verification
              </Text>
            ))}
        </View>
        <View style={styles.section}>
          {error && <Text style={styles.error}>{error}</Text>}
        </View>
      </ScrollView>
    </View>
  );
}

function ObjectView({value}: {value: object}): React.JSX.Element {
  const lines = objectToText(value);
  return (
    <View>
      {lines.map((line, i) => (
        <Text key={i} style={styles.json}>
          {line}
        </Text>
      ))}
    </View>
  );
}

function objectToText(obj: object, indent = 0): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    if (v && typeof v === 'object') {
      return objectToText(v as object, indent + 4);
    }
    return [`${' '.repeat(indent)}${k}: ${v}`];
  });
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
  image: {
    height: 320,
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

export default App;
