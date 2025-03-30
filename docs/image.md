---
title: Image
layout: post
---

<style> 
  .properties h2 ~ p > strong > a { color: crimson; font-size: 110%; text-decoration: none; }
  .properties table { 
    /* margin-left: 3rem; */
    width: calc(100% - 6rem); 
    border:1px solid #555;
    border-collapse: collapse;
  }
  .properties td, .properties th {
    border:1px solid #555;
    padding: 8px;
    line-height: 1.2;
  }
  .properties th {
    background-color:#E2F0F7;
    font-weight:bold !important;
    text-align:center !important;
  }
</style>

# Image

The `image` tag creates an image viewer displaying the image found at the URL specified in the `src` tag.  Additional properties, such as label, may optionally be provided for display in the image metadata and caption bar.

## Quick Start

The most basic use of the `image` tag is to specify the URL of the image to be displayed. The example below shows the Markdown tag used to display an image hosted by the [Wikimedia Commons](https://commons.wikimedia.org/wiki/Main_Page) site.  

##### An example
{: .tabs}

###### Markdown

```markup
`image src=wc:Sunflower_sky_backdrop.jpg`
```

###### HTML

```markup
<iframe
  src="https://ifc.juncture-digital.org/image?src=wc:Sunflower_sky_backdrop.jpg"
></iframe>
```

###### Rendered

`image src=wc:Sunflower_sky_backdrop.jpg`

## Properties
{: .properties}

Many of the image-specific properties used in the ve-image viewer are based on the [IIIF Image API](https://iiif.io/api/image/2.1/).  The property values are often directly passed to the IIIF server hosting the images.  For detailed explanations of the properties and possible values, the [IIIF image request parameters](https://iiif.io/api/image/2.1/#image-request-parameters) documentation should be consulted.

**[alt](#basic-examples)** (_string_):  The text to use in the _alt_ tag used by screen readers.  If not provided an _alt_ tag is automatically generated from the manifest label property.

**[annos](#annotation-examples)** (_url_):  URL to a file containing annotations for the image.  This property is used to override the default URL which is automatically defined relative to the location of the Markdown source file in which the image tag is used.

**[caption](#basic-examples)** (_string_):  When a single image is defined using the `src` property a caption is automatically generated using the label property found in the associated IIIF manifest.  This caption is displayed in the caption bar at the bottom of the viewer by default (this can be inhibited by adding a `nocaption` property).  Specifying a caption in single-image mode will override this with the value provided in this property.  In all other viewer modes (multi-image, audio, and video) no caption is displayed in the caption bar.  Defining a caption with this property will cause the caption bar to be displayed with the provided text.

**[cover](#basic-examples)** (_boolean_):  In the default mode the entire image is shown with letter boxing applied to the top and bottom or left and right when the image aspect ratio differs from the viewer.  When the _cover_ property is set the entire viewport is filled and the displayed portion of the image is cropped as needed to fit.

**[language](#basic-examples)** (_boolean_):  Defines the language to use for the caption and other text metadata when an IIIF `manifest` is used for the image and the manifest contains text for multiple languages.  English (`en`) is used as the default if the property is not specified.

**[manifest](#basic-examples)** (_url_) :  The URL to the IIIF manifest containing an image to display.  This property is omitted when using the `src` property.  When referencing a manifest containing multiple images the `seq` property may be used to identify the specific image to initially display.

**[nocaption](#basic-examples)** (_boolean_):  This property inhibits the display of the caption at the bottom of the image.

**[options](#basic-examples)** (_string_):  The _options_ property combines the `region`, `size`, `rotation`, `quality`, and `format` properties into a single value.  

**[quality](#basic-examples)** (_string_):  The quality property determines whether the image is delivered in color, grayscale or black and white.  Recognized values for this property are `color`, `gray`, `bitonal`, `default`.  The default value used by the Juncture IIIF image server is `color`.

| Value | Description |
| -------- | ---------------------------------------- |
| color   | The image is returned in full color. |
| gray    | The image is returned in grayscale, where each pixel is black, white or any shade of gray in between. |
| bitonal | The image returned is bitonal, where each pixel is either black or white. |
| default | The image is returned using the server’s default quality (e.g. color, gray or bitonal) for the image. |

**[region](#basic-examples)** (_string_):  The region property defines the rectangular portion of the full image to be returned. The region can be specified by pixel coordinates, percentage, or by the value “full”, which specifies that the entire image should be returned.

| Form | Description |
| -------- | ---------------------------------------- |
| full        | The complete image is returned, without any cropping. |
| square      | The region is defined as an area where the width and height are both equal to the length of the shorter dimension of the complete image. The region may be positioned anywhere in the longer dimension of the image content at the server’s discretion, and centered is often a reasonable default. |
| x,y,w,h     | The region of the full image to be returned is specified in terms of absolute pixel values. The value of x represents the number of pixels from the 0 position on the horizontal axis. The value of y represents the number of pixels from the 0 position on the vertical axis. Thus the x,y position 0,0 is the upper left-most pixel of the image. w represents the width of the region and h represents the height of the region in pixels. |
| pct:x,y,w,h | The region to be returned is specified as a sequence of percentages of the full image’s dimensions, as reported in the image information document. Thus, x represents the number of pixels from the 0 position on the horizontal axis, calculated as a percentage of the reported width. w represents the width of the region, also calculated as a percentage of the reported width. The same applies to y and h respectively. These may be floating point numbers. |

**[rights](#basic-examples)** (_string_):  The `rights` property asserts the reuse rights for an image.  The `rights` property value is a string that identifies a license or rights statement that applies to the image. When used, the value must be drawn from the set of [Creative Commons](https://creativecommons.org/licenses/) license URIs or [RightsStatements.org](https://rightsstatements.org/page/1.0/) rights statement URIs.  The license or rights code may also be provided as a value to the `rights` option.  It will be converted to the corresponding URL.

**Creative Commons Licenses**`

| Code | Definition | URL |
| ---- | ---------- | --- |
| **CC0** | Public Domain Dedication | [http://creativecommons.org/publicdomain/zero/1.0/](http://creativecommons.org/publicdomain/zero/1.0/) |
| **CC-BY** | Attribution | [http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/) |
| **CC-BY-SA** | Attribution-ShareAlike | [http://creativecommons.org/licenses/by-sa/4.0/](http://creativecommons.org/licenses/by-sa/4.0/) |
| **CC-BY-ND** | Attribution-NoDerivs | [http://creativecommons.org/licenses/by-nd/4.0/](http://creativecommons.org/licenses/by-nd/4.0/) |
| **CC-BY-NC** | Attribution-NonCommercial | [http://creativecommons.org/licenses/by-nc/4.0/](http://creativecommons.org/licenses/by-nc/4.0/) |
| **CC-BY-NC-SA** | Attribution-NonCommercial | [http://creativecommons.org/licenses/by-nc-sa/4.0/](http://creativecommons.org/licenses/by-nc-sa/4.0/) |
| **CC-BY-NC-ND** | Attribution-NonCommercial-NoDerivs | [http://creativecommons.org/licenses/by-nc-nd/4.0/](http://creativecommons.org/licenses/by-nc-nd/4.0/) |

**Rights Statements**

| Code | Definition | URL |
| ---- | ---------- | --- |
| **InC** | In Copyright | [http://rightsstatements.org/vocab/InC/1.0/](http://rightsstatements.org/vocab/InC/1.0/) |
| **InC-OW-EU** | In Copyright - EU Orphan Work | [http://rightsstatements.org/vocab/InC-OW-EU/1.0/](http://rightsstatements.org/vocab/InC-OW-EU/1.0/) |
| **InC-EDU** | In Copyright - Educational Use Permitted | [http://rightsstatements.org/vocab/InC-EDU/1.0/)](http://rightsstatements.org/vocab/InC-EDU/1.0/) |
| **InC-NC** | In Copyright - Non-Commercial Use Permitted | [http://rightsstatements.org/vocab/InC-NC/1.0/](http://rightsstatements.org/vocab/InC-NC/1.0/) |
| **InC-RUU** | In Copyright - Rights-Holder(s) Unlocatable or Unidentifiable | [http://rightsstatements.org/vocab/InC-RUU/1.0/](http://rightsstatements.org/vocab/InC-RUU/1.0/) |
| **NoC-CR** | No Copyright - Contractual Restrictions | [http://rightsstatements.org/vocab/NoC-CR/1.0/](http://rightsstatements.org/vocab/NoC-CR/1.0/) |
| **NoC-NC** | No Copyright - Non-Commercial Use Only | [http://rightsstatements.org/vocab/NoC-NC/1.0/](http://rightsstatements.org/vocab/NoC-NC/1.0/) |
| **NoC-OKLR** | No Copyright - Other Known Legal Restrictions | [http://rightsstatements.org/vocab/NoC-OKLR/1.0/](http://rightsstatements.org/vocab/NoC-OKLR/1.0/) |
| **NoC-US** | No Copyright - United States | [http://rightsstatements.org/vocab/NoC-US/1.0/](http://rightsstatements.org/vocab/NoC-US/1.0/) |
| **CNE** | Copyright Not Evaluated | [http://rightsstatements.org/vocab/CNE/1.0/](http://rightsstatements.org/vocab/CNE/1.0/) |
| **UND** | Copyright Undertermined | [http://rightsstatements.org/vocab/UND/1.0/](http://rightsstatements.org/vocab/UND/1.0/) |
| **NKC** | No Known Copyright | [http://rightsstatements.org/vocab/NKC/1.0/](http://rightsstatements.org/vocab/NKC/1.0/) |

**[rotation](#basic-examples)** (_number_):  The rotation property specifies mirroring and rotation. A leading exclamation mark (“!”) indicates that the image should be mirrored by reflection on the vertical axis before any rotation is applied. The numerical value represents the number of degrees of clockwise rotation, and may be any floating point number from 0 to 360.

**[seq](#basic-examples)** (_number_):  A number defining the image to use in a multi-image manifest.  If not specified the default value is _1_.

**[size](#basic-examples)** (_string_):  The size parameter determines the dimensions to which the extracted region is to be scaled.

| Form | Description |
| -------- | ---------------------------------------- |
| full  | The image or region is not scaled, and is returned at its full size. |
| max   | The image or region is returned at the maximum size available, as indicated by maxWidth, maxHeight, maxArea in the profile description. This is the same as full if none of these properties are provided. |
| w,    | The image or region should be scaled so that its width is exactly equal to w, and the height will be a calculated value that maintains the aspect ratio of the extracted region. |
| ,h    | The image or region should be scaled so that its height is exactly equal to h, and the width will be a calculated value that maintains the aspect ratio of the extracted region. |
| pct:n |   The width and height of the returned image is scaled to n% of the width and height of the extracted region. The aspect ratio of the returned image is the same as that of the extracted region. |
| w,h   |The width and height of the returned image are exactly w and h. The aspect ratio of the returned image may be different than the extracted region, resulting in a distorted image. |
| !w,h  | The image content is scaled for the best fit such that the resulting width and height are less than or equal to the requested width and height. The exact scaling may be determined by the service provider, based on characteristics including image quality and system performance. The dimensions of the returned image content are calculated to maintain the aspect ratio of the extracted region. |

**[showannos](#annotation-examples)** (_boolean_):  When this property is set any annotations associated with the image will be shown initially.  When this property is not set the user can toggle the display of annotations by clicking on the annotation icon located in the right section of the caption bar.

**[src](#basic-examples)** (_url_) :  The URL to the image to display.  This property is omitted when using the `manifest` tag.  A `src` URL may be a full URL, a relative URL (relative to the URL of the Markdown file containing the image tag), or a short-hand URL when using images hosted by Wikimedia Commons or GitHub.  In those cases a `wc:` or `gh:` prefix may be used for convenience.  

- When using the `wc:` prefix only the Wikimedia Commons file name is required.
- When using the `gh:` prefix the GitHub account, repository, branch, and file path are added after the prefix.  Each value is separated by the slash (`/`) character.

## Examples

### Basic Examples

#### Wikimedia Commons example

This example uses an image hosted by Wikimedia Commons.  When using Wikimedia Commons images the `wc:` prefix may be used instead of the full URL and image information (title, summary, rights, etc) is automatically retrieved from the Wikimedia Commons site and added to the viewer.  Click on the <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 512" height="1em" width="1em"><path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z"/></svg> icon in the caption to see the image info.

In this example the positioning properties `medium` and `center` are used to display the image in the center of the window at 50% of the window width. 

##### &nbsp;
{: .tabs}

###### Markdown

```markup
`image src=wc:Incense_in_Vietnam.jpg medium center`
```

###### HTML

```markup
<iframe
  src="image?src=wc:Incense_in_Vietnam.jpg"
  class="medium center"
  allowfullscreen
></iframe>
```

###### Rendered

`image src=wc:Incense_in_Vietnam.jpg medium center`


#### GitHub example

In this example a GitHub hosted image is used and the `gh:` short-hand prefix is used in the `src` property.  The image is hosted in the `ifc` repository in the `rsnyder` GitHub account.  It is in the `main` branch and is located at the `docs/components/monument-valley.jpg` path.  The full `src` value is `gh:rsnyder/ifc/main/docs/components/monument-valley.jpg`.

In this example the positioning properties `medium` and `center` are used to display the image in the center of the window at 50% of the window width. The `box-shadow` property is also set to add a subtle box shadow effect to the component.


##### &nbsp;
{: .tabs}

###### Markdown

```markup
`image src=gh:rsnyder/ifc/main/docs/components/monument-valley.jpg medium center box-shadow static`
```

###### HTML

```markup
<iframe
  src="image?src=gh:rsnyder/ifc/main/docs/components/monument-valley.jpg&static"
  class="medium center box-shadow"
  allowfullscreen
></iframe>
```

###### Rendered

`image src=gh:rsnyder/ifc/main/docs/components/monument-valley.jpg medium center box-shadow static`

### Annotations 

#### Annotated image example

##### &nbsp;
{: .tabs}

###### Markdown

```markup
`image src=wc:Monument_Valley,_Utah,_USA_(23611451292).jpg medium center box-shadow static`
```

###### HTML

```markup
<iframe
  src="image?src=wc:Monument_Valley,_Utah,_USA_(23611451292).jpg&static"
  class="medium center box-shadow"
  allowfullscreen
></iframe>
```

###### Rendered

`image src=wc:Monument_Valley,_Utah,_USA_(23611451292).jpg medium center box-shadow static`

