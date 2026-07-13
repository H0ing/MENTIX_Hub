import https from 'https';
import { URL } from 'url';
import { findById as findUserById } from '../repositories/userRepository.js';
import { findById as findProjectById } from '../repositories/projectRepository.js';
import AppError from '../utils/AppError.js';
import { success } from '../utils/response.js';

function proxyFile(cloudinaryUrl, res, downloadName) {
  return new Promise((resolve, reject) => {
    const url = new URL(cloudinaryUrl);

    https.get(url, (cloudRes) => {
      if (cloudRes.statusCode >= 400) {
        cloudRes.resume();
        return reject(new AppError('File not found on storage', 404));
      }

      if (downloadName) {
        res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
      }

      res.setHeader('Content-Type', cloudRes.headers['content-type'] || 'application/octet-stream');
      cloudRes.pipe(res);
      cloudRes.on('end', resolve);
    }).on('error', (err) => {
      reject(new AppError('Failed to fetch file from storage', 502));
    });
  });
}

async function downloadAvatar(req, res) {
  const { userId } = req.params;

  const userResult = await findUserById(userId);
  if (!userResult.rows.length) {
    throw new AppError('User not found', 404);
  }

  const user = userResult.rows[0];
  if (!user.avatar_url) {
    throw new AppError('User has no avatar', 404);
  }

  res.redirect(user.avatar_url);
}

async function downloadProjectFile(req, res) {
  const { projectId } = req.params;

  const projectResult = await findProjectById(projectId);
  if (!projectResult.rows.length) {
    throw new AppError('Project not found', 404);
  }

  const project = projectResult.rows[0];
  if (!project.file_path) {
    throw new AppError('Project has no file', 404);
  }

  const downloadName = project.file_original_name || `${project.title}.zip`;
  await proxyFile(project.file_path, res, downloadName);
}

async function downloadProjectThumbnail(req, res) {
  const { projectId } = req.params;

  const projectResult = await findProjectById(projectId);
  if (!projectResult.rows.length) {
    throw new AppError('Project not found', 404);
  }

  const project = projectResult.rows[0];
  if (!project.thumbnail) {
    throw new AppError('Project has no thumbnail', 404);
  }

  res.redirect(project.thumbnail);
}

export {
  downloadAvatar,
  downloadProjectFile,
  downloadProjectThumbnail
};
