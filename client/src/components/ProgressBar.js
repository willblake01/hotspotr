import React from 'react';
import { LinearProgress } from '@mui/material';

export const ProgressBar = ({completed}) => (
  <LinearProgress variant='determinate' value={completed} />
)
