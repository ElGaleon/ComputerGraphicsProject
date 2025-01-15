/*************************** GLM *********************************/
	const MAXVAL = 40;

	function Group(name) {
	  this.name = name;                  /* name of this group */
	  this.triangles = [];      /* array of triangle indices */
	  return this;
	};

	function Material(name){
		this.name = name;
		this.parameter = new Map();
		this.triangles = [];      /* array of triangle indices */
		if(name === "default"){
			this.parameter.set("Ka", [1.000000, 1.000000, 1.000000]);
			this.parameter.set("Ks", [0.500000, 0.500000, 0.500000]);
			this.parameter.set("Kd", [0.800000, 0.800000, 0.800000]);
			this.parameter.set("d", 1.000000);
			this.parameter.set("Ns", 721.654927);
		}
		return this;
	};

	function FindElement(list, name) {
    let element = null;

    for (let i=0; i<list.length && !element; i++) {
		if (name===list[i].name) element = list[i];
	   }

	   return element;
	}

	function AddElement(list, name, constructor) {
    let element = FindElement(list, name);
    if (!element) {
			element = new constructor(name);
			list.push(element);
	    }

	    return element;
	}

	function Cross(u, v) {
	    return [u[1]*v[2] - u[2]*v[1], u[2]*v[0] - u[0]*v[2], u[0]*v[1] - u[1]*v[0]];
	}

	function Normalize(v) {
    const l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    v[0] /= l;
	    v[1] /= l;
	    v[2] /= l;
	    return v;
	}

	function Dot(u,v)
	{
	    return u[0]*v[0] + u[1]*v[1] + u[2]*v[2];
	}

	function FacetNormals (mesh) {
	    var u = new Float64Array(3);
	    var v = new Float64Array(3);

	    if (mesh == null) return;
		if(mesh.vert == null) return;
		if(mesh.face == null) return;

		mesh.facetnorms.push({i: 0, j: 0, k: 0,});

    let normalFace;
    for (var i = 1; i <= mesh.nface; i++) {
      mesh.face[i].normalFaceIndex = i;

      u[0] = mesh.vert[mesh.face[i].vert[1]].x -
        mesh.vert[mesh.face[i].vert[0]].x;
      u[1] = mesh.vert[mesh.face[i].vert[1]].y -
        mesh.vert[mesh.face[i].vert[0]].y;
      u[2] = mesh.vert[mesh.face[i].vert[1]].z -
        mesh.vert[mesh.face[i].vert[0]].z;

      v[0] = mesh.vert[mesh.face[i].vert[2]].x -
        mesh.vert[mesh.face[i].vert[0] + 0].x;
      v[1] = mesh.vert[mesh.face[i].vert[2]].y -
        mesh.vert[mesh.face[i].vert[0]].y;
      v[2] = mesh.vert[mesh.face[i].vert[2]].z -
        mesh.vert[mesh.face[i].vert[0]].z;

      let cross = new Float64Array(3);
      cross = Cross(u, v);
      let norm = new Float64Array(3);
      norm = Normalize(cross);
      normalFace = {i: norm[0], j: norm[1], k: norm[2],};
      mesh.facetnorms.push(normalFace);
    }
	}

function Unitize(mesh) {
  let i;
  let maxx, minx, maxy, miny, maxz, minz;
  let w, h, d;

  // get the max/mins
    maxx = minx = mesh.vert[1].x;
    maxy = miny = mesh.vert[1].y;
    maxz = minz = mesh.vert[1].z;
    for (i = 2; i < mesh.vert.length; i++) {
        if (maxx < mesh.vert[i].x)
            maxx = mesh.vert[i].x;
        if (minx > mesh.vert[i].x)
            minx = mesh.vert[i].x;

        if (maxy < mesh.vert[i].y)
            maxy = mesh.vert[i].y;
        if (miny > mesh.vert[i].y)
            miny = mesh.vert[i].y;

        if (maxz < mesh.vert[i].z)
            maxz = mesh.vert[i].z;
        if (minz > mesh.vert[i].z)
            minz = mesh.vert[i].z;
    }

    //calculate model width, height, and depth
    w = maxx - minx;
    h = maxy - miny;
    d = maxz - minz;

    // calculate center of the model
  let cx = (maxx + minx) / 2.0;
  let cy = (maxy + miny) / 2.0;
  let cz = (maxz + minz) / 2.0;

    // calculate unitizing scale factor
  let scale = 2.0 / Math.max(Math.max(w, h), d);

    // translate around center then scale
    for (i = 1; i < mesh.vert.length; i++) {
        mesh.vert[i].x -= (cx);
        mesh.vert[i].y -= (cy);
        mesh.vert[i].z -= (cz);
        mesh.vert[i].x *= (scale);
        mesh.vert[i].y *= (scale);
        mesh.vert[i].z *= (scale);
    }

    return {
	scale: scale,
	cx: cx,
	cy: cy,
	cz: cz,
    }
}

/* TranslateScale: Translates and Scales a model by a given amount */
function TranslateScale(scale, cx, cy, cz)
{
    //translate around center then scale
    for (let i = 1; i <= mesh.vert.length; i++){
        mesh.vert[i].x -= cx;
        mesh.vert[i].y -= cy;
        mesh.vert[i].z -= cz;
        mesh.vert[i].x *= scale;
        mesh.vert[i].y *= scale;
        mesh.vert[i].z *= scale;
        mesh.normal[i].i *= scale;
        mesh.normal[i].j *= scale;
        mesh.normal[i].k *= scale;
    }
}

function Node(){
	this.indexFace = [];		//list of index of face that use this vertices
	this.averaged = [];
}

function VertexNormals(mesh, angle) {

	let j;
  let i;
// calculate the cosine of the angle (in degrees)
	var cos_angle = Math.cos(angle * Math.PI / 180.0);

	var members = [];	//lista di oggetti Node, ognuno fa riferimento a uno specifico vertice
	for(i = 1; i <= mesh.nface; i++){
		for(j = 0; j < mesh.face[i].n_v_e; j++){
			node = FindNodeInMembers(mesh.face[i].vert[j]);
			node.indexFace.unshift(i);
		}
	}

  const average = new Float64Array(3);
  let numNormals = 1;
  let node;
  let avg;
  for (i = 1; i < members.length; i++) {
    node = members[i];
    avg = 0;
    average[0] = 0.0;
    average[1] = 0.0;
    average[2] = 0.0;
    for (j = 0; j < members[i].indexFace.length; j++) {
      const u = new Float64Array(3);
      const v = new Float64Array(3);
      u[0] = mesh.facetnorms[node.indexFace[j]].i;
      u[1] = mesh.facetnorms[node.indexFace[j]].j;
      u[2] = mesh.facetnorms[node.indexFace[j]].k;
      v[0] = mesh.facetnorms[members[i].indexFace[0]].i;
      v[1] = mesh.facetnorms[members[i].indexFace[0]].j;
      v[2] = mesh.facetnorms[members[i].indexFace[0]].k;
      const dot = Dot(u, v);
      if (dot > cos_angle) {
        average[0] += mesh.facetnorms[node.indexFace[j]].i;
        average[1] += mesh.facetnorms[node.indexFace[j]].j;
        average[2] += mesh.facetnorms[node.indexFace[j]].k;
        avg = 1;
        node.averaged[j] = true;
      } else node.averaged[j] = false;
    }
    if (avg) {
      Normalize(average);
      mesh.normal[numNormals] = {i: average[0], j: average[1], k: average[2],};
      avg = numNormals;
      numNormals++;
    }
    for (j = 0; j < members[i].indexFace.length; j++) {
      if (node.averaged[j]) {
        for (let h = 0; h < mesh.face[members[i].indexFace[j]].n_v_e; h++) {
          const c = mesh.face[members[i].indexFace[j]].vert[h];
          if (mesh.face[members[i].indexFace[j]].vert[h] === i)
            mesh.face[members[i].indexFace[j]].normalVertexIndex[h] = avg;
        }
      } else {
        numNormals++;
        mesh.normal[numNormals] = mesh.facetnorms[mesh.face[members[i].indexFace[j]].normalFaceIndex];
        for (h = 0; h < mesh.face[members[i].indexFace[j]].n_v_e; h++)
          if (mesh.face[members[i].indexFace[j]].vert[h] === i)
            mesh.face[members[i].indexFace[j]].normalVertexIndex[h] = numNormals;
      }
    }
  }

	function FindNodeInMembers(indexVertex){
		var node = members[indexVertex];
		if(!node){
			node = new Node();
			members[indexVertex]= node;
		}
		return node;
	}
}

function glmReadOBJ(data, mesh){

  let numTriangles = 0;
  let group = AddElement(mesh.groups, "default", Group);
  let material = AddElement(mesh.materials, "default", Material);
  let mtllibname = null;
  let x, y, z;
  let ni, nj, nk;
  let u;

  mesh.vert.push(new nvr());
	mesh.normal.push({i: 0, j: 0, k: 0,});
	mesh.textCoords.push({u: 0, v: 0, w: 0,});
	mesh.face.push(new nfc());

  const lines = data.split("\n");
  for (let j=0; j<lines.length; j++) {
    const buf = lines[j].trimRight().split(/\s+/);
    switch(buf[0]) {
		case '#':               // comment
			break;
		case 'v':               //v, vn, vt
			x = parseFloat(buf[1]); y = parseFloat(buf[2]); z = parseFloat(buf[3]);

      const vert = new nvr();
      vert.x = x; vert.y = y; vert.z = z;
			mesh.vert.push(vert);
			break;
		case 'vn':               // v, vn, vt
			ni = parseFloat(buf[1]); nj = parseFloat(buf[2]); nk = parseFloat(buf[3]);

      const normal = {i: ni, j: nj, k: nk,};
      mesh.normal.push(normal);

			break;
		case 'vt':               // v, vn, vt
			u = parseFloat(buf[1]); v = parseFloat(buf[2]);

      const textCoord = {u: u, v: v};
      mesh.textCoords.push(textCoord);

			break;
		case 'mtllib':
			if(buf.length > 1 && buf[1].endsWith('.mtl')) mtllibname = buf[1];
			break;
		case 'usemtl':
			if(!buf[1].includes("null"))material = AddElement(mesh.materials, buf[1], Material);
			break;
		case 'g':               // group
			group = AddElement(mesh.groups, buf[1], Group);
			break;
		case 'f':               // face
      const f1 = buf[1].split('/');
      const f2 = buf[2].split('/');
      const f3 = buf[3].split('/');
      let f4 = null;
      if (buf.length>4) f4 = buf[4].split('/');

      const vindex = [];
      const tindex = [];
      const nindex = [];

      vindex.push(parseFloat(f1[0]));
			if (f1[1]) tindex.push(parseFloat(f1[1]));// - 1;	//indice texcoord
			if (f1[2]) nindex.push(parseFloat(f1[2]));// - 1;	//indice normale

			vindex.push(parseFloat(f2[0]));// - 1;
			if (f2[1]) tindex.push(parseFloat(f2[1]));// - 1;
			if (f2[2]) nindex.push(parseFloat(f2[2]));// - 1;

			vindex.push(parseFloat(f3[0]));// - 1;
			if (f3[1]) tindex.push(parseFloat(f3[1]));// - 1;
			if (f3[2]) nindex.push(parseFloat(f3[2]));// - 1;

			AddFace(vindex, tindex, nindex);

			if (f4 != null) {
				vindex[1] = vindex[2];
				if(tindex.length > 0)tindex[1] = tindex[2];
				if(nindex.length > 0)nindex[1] = nindex[2];
				vindex[2] = parseFloat(f4[0]);// - 1;
				if(f4[1])tindex[2] = parseFloat(f4[1]);// - 1;
				if(f4[2])nindex[2] = parseFloat(f4[2]);// - 1;
				AddFace(vindex, tindex, nindex);
			}

			break;
		}
	}
	mesh.nvert = mesh.vert.length - 1;
	mesh.nface = mesh.face.length - 1;
	FacetNormals(mesh);
	if(mesh.normal.length === 1 ) VertexNormals(mesh, 180);		//il file non conteneva le normali ai vertici => vanno calcolate

	return {mesh: mesh, fileMtl: mtllibname};

	function AddFace(vindex, tindex, nindex){
    const face = new nfc();
    numTriangles++;

		face.n_v_e = 3;
		face.group = mesh.groups.indexOf(group);
		face.material = mesh.materials.indexOf(material);
		for(var i = 0; i < 3; i++){
			face.vert[i] = vindex[i];
			if(tindex.length >= i+1) face.textCoordsIndex[i] = tindex[i];
			if(nindex.length >= i+1) face.normalVertexIndex[i] = nindex[i];
		}
		mesh.face.push(face);

		group.triangles.push(numTriangles);
		material.triangles.push(numTriangles);
	}
}

function glmReadMTL(data, mesh){

  const lines = data.split("\n");
  for (j=0; j<lines.length; j++) {
    let buf = lines[j].trimRight().split(/\s+/);
    switch(buf[0]) {
			case '#':
				break;
			case 'newmtl':
        let material = null;
        for(let i=0; i < mesh.materials.length && !material; i++){
					if(mesh.materials[i].name === buf[1]) material = mesh.materials[i];
				}

				j++;
				while(j < lines.length && (buf = lines[j].trimRight().trimLeft().split(/\s+/)).length > 1){
					if(material){
            let v;
            switch(buf[0]){
							case 'map_Ka': case 'map_Kd': case 'map_Ks':
								v = buf[1];
								break;
							case 'illum': case 'sharpness':
								v = parseInt(buf[1]);
								break;
							case 'd': case 'Ni': case 'Ns': case 'Tr':
								v = parseFloat(buf[1]);
								break;
							case 'Ka': case 'Kd': case 'Ks': case 'Ke': case 'Tf':
                v = [];
                for(let h = 1; h < buf.length; h++){
									v.push(parseFloat(buf[h]));
								}
								break;
						}
						material.parameter.set(buf[0], v);
					}
					j++;
				}
				break;
		}
	}
}

