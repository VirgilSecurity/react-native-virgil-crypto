import RNFetchBlob from 'rn-fetch-blob';
import {virgilCrypto} from 'react-native-virgil-crypto';

export const downloadVerifyAndDecryptImage = ({url, keypair, extension}) => {
  return downloadImage(url, extension)
    .then(downloadedImage => verifyImageSignature(downloadedImage, keypair))
    .then(verifiedImage => decryptImage(verifiedImage, keypair))
    .then(decryptedImage => cleanupAfterDownload(decryptedImage));
};

const downloadImage = (url, extension) => {
  return RNFetchBlob.config({
    fileCache: true,
    appendExt: extension,
  })
    .fetch('GET', url)
    .then(res => {
      let {status, headers} = res.info();

      if (status === 200) {
        const signature = headers['x-signature'];
        return {downloadedFilePath: res.path(), signature};
      }

      return res
        .text()
        .then(errorMessage =>
          Promise.reject(
            new Error(
              `The server responded with status code ${status}; ${errorMessage}`,
            ),
          ),
        );
    });
};

const verifyImageSignature = (image, keypair) => {
  return virgilCrypto
    .verifyFileSignature({
      inputPath: image.downloadedFilePath,
      signature: image.signature,
      publicKey: keypair.publicKey,
    })
    .then(isSigantureVerified => ({
      ...image,
      isSigantureVerified,
    }));
};

const decryptImage = (image, keypair) => {
  if (!image.isSigantureVerified) {
    return Promise.resolve(image);
  }

  return virgilCrypto
    .decryptFile({
      inputPath: image.downloadedFilePath,
      // This can be a custom path that your application can write to
      // e.g. RNFetchBlob.fs.dirs.DocumentDir + '/decrypted_downloads/' + image.id + '.jpg';
      // If not specified, a temporary file will be created
      outputPath: undefined,
      privateKey: keypair.privateKey,
    })
    .then(decryptedFilePath => ({
      ...image,
      uri: `file://${decryptedFilePath}`,
    }));
};

const cleanupAfterDownload = image => {
  // remove temporary file where we stored the downloaded ecnrypted image
  const {downloadedFilePath, ...rest} = image;
  return RNFetchBlob.fs
    .unlink(downloadedFilePath)
    .catch(err => {
      console.log(
        `Failed to remove temporary download file at ${downloadedFilePath}`,
        err,
      );
    })
    .then(() => rest);
};
