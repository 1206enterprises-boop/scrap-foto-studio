const urlParams = new URLSearchParams(window.location.search);
const type = urlParams.get('type'); // 'strip' or '4x6'

const frames = type === 'strip' ? [
  'img/strip_frame1.png',
  'img/strip_frame2.png'
] : [
  'img/4x6_frame1.png',
  'img/4x6_frame2.png'
];

const gallery = document.getElementById('frameGallery');
frames.forEach(src => {
  const img = document.createElement('img');
  img.src = src;
  img.addEventListener('click', () => {
    localStorage.setItem('frame', src);
    if(type==='strip') window.location.href='studio-strip/index.html';
    else window.location.href='studio-4x6/index.html';
  });
  gallery.appendChild(img);
});

function goHome(){ window.location.href='../landing.html'; }
function goBack(){ window.history.back(); }
