function transform(src) {
    let r = '';
    src.replace(/^\s+|\r|\s+$/g, '')
      .replace(/\t/g, '    ')
      .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/~(.*?)~/g, '<del>$1</del>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .split(/\n\n+/)
      .forEach(function(v, i, A){
					r += '<p>'+v+'</p>';
      });
    return r;
}