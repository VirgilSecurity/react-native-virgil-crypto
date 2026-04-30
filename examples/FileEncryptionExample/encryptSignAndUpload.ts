import ReactNativeBlobUtil from 'react-native-blob-util';
import {virgilCrypto} from 'react-native-virgil-crypto';
import type {Asset} from 'react-native-image-picker';

export type Keypair = ReturnType<typeof virgilCrypto.generateKeys>;

type EncryptedImage = Asset & {encryptedFilePath: string};
type SignedImage = EncryptedImage & {signature: string};
type UploadedImage = SignedImage & {id: string};

const encryptImage = async (
  image: Asset,
  keypair: Keypair,
): Promise<EncryptedImage> => {
  const encryptedFilePath = await virgilCrypto.encryptFile({
    inputPath: image.uri!,
    // Custom output path is also supported, e.g.:
    //   ReactNativeBlobUtil.fs.dirs.DocumentDir + '/encrypted_uploads/' + image.fileName
    // If undefined, a temporary file is created.
    outputPath: undefined,
    publicKeys: keypair.publicKey,
  });
  return {...image, encryptedFilePath};
};

const signImage = async (
  image: EncryptedImage,
  keypair: Keypair,
): Promise<SignedImage> => {
  const signature = await virgilCrypto.generateFileSignature({
    inputPath: image.encryptedFilePath,
    privateKey: keypair.privateKey,
  });
  return {...image, signature: signature.toString('base64')};
};

const uploadImage = async (
  image: SignedImage,
  url: string,
): Promise<UploadedImage> => {
  const data = new FormData();
  data.append('photo', {
    uri: 'file://' + image.encryptedFilePath,
    type: image.type,
    name: image.fileName,
  } as unknown as Blob);
  data.append('signature', image.signature);

  const res = await fetch(url, {method: 'POST', body: data});
  if (!res.ok) {
    const errorMessage = await res.text();
    throw new Error(
      `The server responded with status code ${res.status}; ${errorMessage}`,
    );
  }
  const id = await res.text();
  return {...image, id};
};

const cleanupAfterUpload = async (
  image: UploadedImage,
): Promise<Omit<UploadedImage, 'encryptedFilePath'>> => {
  const {encryptedFilePath, ...rest} = image;
  try {
    await ReactNativeBlobUtil.fs.unlink(encryptedFilePath);
  } catch (err) {
    console.log(
      `failed to remove temporary file at ${encryptedFilePath}`,
      err,
    );
  }
  return rest;
};

export const encryptSignAndUploadImage = async ({
  image,
  url,
  keypair,
}: {
  image: Asset | null;
  url: string;
  keypair: Keypair;
}) => {
  if (image == null) {
    return null;
  }

  console.log(image);
  const encrypted = await encryptImage(image, keypair);
  const signed = await signImage(encrypted, keypair);
  const uploaded = await uploadImage(signed, url);
  return cleanupAfterUpload(uploaded);
};
