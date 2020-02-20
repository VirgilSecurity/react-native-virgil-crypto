import RNFetchBlob from 'rn-fetch-blob';
import {virgilCrypto} from 'react-native-virgil-crypto';

export const encryptSignAndUploadImage = ({image, url, keypair}) => {
  if (image == null) {
    return Promise.resolve(image);
  }

  console.log(image);

  return encryptImage(image, keypair)
    .then(encryptedImage => signImage(encryptedImage, keypair))
    .then(encryptedSignedImage => uploadImage(encryptedSignedImage, url))
    .then(uploadedImage => cleanupAfterUpload(uploadedImage));
};

const encryptImage = (image, keypair) => {
  return virgilCrypto
    .encryptFile({
      inputPath: image.uri,
      // This can be a custom path that your application can write to
      // e.g. RNFetchBlob.fs.dirs.DocumentDir + '/encrypted_uploads/' + image.fileName,
      // If not specified, a temporary file will be created
      outputPath: undefined,
      publicKeys: keypair.publicKey,
    })
    .then(encryptedFilePath => ({
      ...image,
      encryptedFilePath,
    }));
};

const signImage = (image, keypair) => {
  return virgilCrypto
    .generateFileSignature({
      inputPath: image.encryptedFilePath,
      privateKey: keypair.privateKey,
    })
    .then(signature => ({
      ...image,
      signature: signature.toString('base64'),
    }));
};

const uploadImage = (image, url) => {
  const data = new FormData();
  data.append('photo', {
    uri: 'file://' + image.encryptedFilePath,
    type: image.type,
    name: image.fileName,
  });
  data.append('signature', image.signature);

  return fetch(url, {method: 'POST', body: data})
    .then(res => {
      if (res.ok) {
        return res.text();
      }

      return res
        .text()
        .then(errorMessage =>
          Promise.reject(
            new Error(
              `The server responded with status code ${
                res.status
              }; ${errorMessage}`,
            ),
          ),
        );
    })
    .then(id => ({...image, id}));
};

const cleanupAfterUpload = image => {
  // remove the temporary file where we stored encrypted image
  const {encryptedFilePath, ...rest} = image;
  return RNFetchBlob.fs
    .unlink(encryptedFilePath)
    .catch(err => {
      console.log(
        `failed to remove temporary file at ${encryptedFilePath}`,
        err,
      );
    })
    .then(() => rest);
};
