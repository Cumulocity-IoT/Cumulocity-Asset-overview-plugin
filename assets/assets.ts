/**
 * Copyright (c) 2020 Software AG, Darmstadt, Germany and/or its licensors
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * This file is to include certain images or CSS files into the bundle. As for plugins,
 * you need to bundle *all* assets due to a relative or absolute path might not work.
 *
 * Currently supported file extensions are: jpeg, jpg, gif, png, woff(2), eot, ttf, svg, css, sass and less
 *
 * If you need more types supported, add them to the d.ts file and add a webpack rule.
 */
import previewImage from './preview image.png';

// this will be a global style -> try to avoid as it could break existing styles
// better use component based styling (see ../widget/widget-plugin.component.css)
import './example.css';

// paths can be shared via this module if needed
export const assetPaths = { previewImage };
