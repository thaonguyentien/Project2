var express = require('express');
var passport=require('passport');
var gv = require('../models/giangvien');
var lop = require('../models/lop');
var user = require('../models/user');

var bodyParser = require('body-parser');
var multer = require('multer');
var XLSX = require('xlsx');
const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);

var router = express.Router();

login=false;
var emailGlobal,data;

router.use(bodyParser.json());

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});

var upload = multer({ //multer settings
    storage: storage,
    fileFilter : function(req, file, callback) { //file filter
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');

router.get('/',isLoggedIn, function(req, res, next) {
  emailGlobal=req.user;
  res.render('home',{
    user:req.user,
    message1:req.flash('loginMessage'),
    message2:req.flash('signupMessage'),
    login:login
  });
});

router.get('/login',isLoggedIn,function(req,res,next){
  res.render('login.ejs',{
    user:emailGlobal,
    message1:req.flash('loginMessage'),
    message2:req.flash('signupMessage')
  });
});

router.get('/signup',isLoggedIn,function(req,res){
  res.render('signup.ejs',{
    user:emailGlobal,
    message1:req.flash('loginMessage'),
    message2:req.flash('signupMessage')
  });
});

router.get('/login',isLoggedIn,function(req,res,next){
  res.render('login.ejs',{
    user:emailGlobal,
    message1:req.flash('loginMessage'),
    message2:req.flash('signupMessage')
  });
});

router.get('/profile',isLoggedIn,function(req,res){
  res.render('profile.ejs',{
    user:emailGlobal,
    message1:req.flash('loginMessage'),
    message2:req.flash('signupMessage')
  });
});

router.get('/logout',isLoggedIn,function(req,res){
  req.logout();
  login=false;
  res.redirect('/users');
})

router.post('/login',passport.authenticate('local-login',{
  successRedirect: '/users',
  failureRedirect: '/',
  failureFlash: true,
}))

router.post('/signup',passport.authenticate('local-signup',{
  successRedirect:'/',
  failureRedirect:'/',
  failureFlash:true,
}));

router.get('/nhapdulieu',isLoggedIn, function(req, res, next) {
  var dslop=[],lopAll;
  lop.find({},function(err,result){
    if(err) throw err;
    if(result){
      var lopAll=result;
      for(i=0;i<lopAll.length;++i){
        for(j=0;j<lopAll[i].hoc.length;++j){
            dslop.push(lopAll[i].hoc[j]);
        }
      }
      res.render('nhapdulieu',{
        data:dslop,
        user:emailGlobal,
        message1:req.flash('loginMessage'),
        message2:req.flash('signupMessage'),
        login:login
      });
    }
  })
});

router.get('/nhapdulieuExcel',isLoggedIn, function(req, res, next) {

  res.render('nhapdulieu',{
    gv:data,
    user:emailGlobal,
    message1:req.flash('loginMessage'),
    message2:req.flash('signupMessage'),
    login:login});
});

router.post('/nhapdulieu',isLoggedIn, function(req, res, next) {
  gv.findOne({'email':req.body.email},function(err,giangVien){
    if(err) return done(err);
    if(giangVien){
      var temp={
        tenGv:req.body.giang_vien,
        email:req.body.email,
        dienthoai:req.body.dien_thoai,
        tenlop:req.body.ten_lop,
        malop:req.body.ma_lop,
        malopHoc:req.body.ma_lop_hoc,
        soLuongSV:req.body.so_luong_sv,
        maHP:req.body.maHP,
        khoa:req.body.khoa,
        soTinChi:req.body.so_tin_chi,
        thu:null,
        tiet:null,
        thoiGianBatDau:null,
        thoiGianKetThuc:null,
        ghiChu:req.body.ghi_chu
      };

      giangVien.day.push(temp);
      giangVien.save(function(err) {
        if (err)
          throw err;
        console.log("đã tồn tại giảng viên đã thêm lớp mới cho giảng viên ",giangVien.tenGv);
      });
    }else{
      var newGv= new gv();
      newGv.tenGv=req.body.giang_vien;
      newGv.email=req.body.email;
      newGv.dienthoai=req.body.dien_thoai;

      var temp={
        tenGv:req.body.giang_vien,
        email:req.body.email,
        dienthoai:req.body.dien_thoai,
        tenlop:req.body.ten_lop,
        malop:req.body.ma_lop,
        malopHoc:req.body.ma_lop_hoc,
        soLuongSV:req.body.so_luong_sv,
        maHP:req.body.maHP,
        khoa:req.body.khoa,
        soTinChi:req.body.so_tin_chi,
        thu:null,
        tiet:null,
        thoiGianBatDau:null,
        thoiGianKetThuc:null,
        ghiChu:req.body.ghi_chu
      };
      newGv.day.push(temp);
      newGv.save(function(err) {
        if (err)throw err;
        console.log('đã thêm giảng viên mới',newGv.tenGv);
      });
    }
  })

  lop.findOne({'malop':req.body.ma_lop},function(err,malop){
    if(err) return done(err);
    if(malop){
      var temp={
        malopHoc:req.body.ma_lop_hoc,
        soLuongSV:req.body.so_luong_sv,
        maHP:req.body.maHP,
        khoa:req.body.khoa,
        soTinChi:req.body.so_tin_chi,
        thu:null,
        tiet:null,
        thoiGianBatDau:null,
        thoiGianKetThuc:null,
        ghiChu:req.body.ghi_chu
      };

      malop.hoc.push(temp);
      malop.save(function(err) {
        if (err)
          throw err;
        console.log("đã tồn tại lớp và đã thêm lớp học cho lớp: ",malop.tenlop);
      });
    }else{
      var newLop= new lop();
      newLop.tenlop=req.body.ten_lop;
      newLop.malop=req.body.ma_lop;
      var temp={
        malopHoc:req.body.ma_lop_hoc,
        soLuongSV:req.body.so_luong_sv,
        maHP:req.body.maHP,
        khoa:req.body.khoa,
        soTinChi:req.body.so_tin_chi,
        thu:null,
        tiet:null,
        thoiGianBatDau:null,
        thoiGianKetThuc:null,
        ghiChu:req.body.ghi_chu
      };
      newLop.hoc.push(temp);
      newLop.save(function(err) {
        if (err)
          throw err;
        console.log('đã thêm lớp mới',newLop.tenlop);
      });
    }
  })

  lop.find({},function(err,result){
    if(err) throw err;
    if(result){
      data=result;
      res.render('nhapdulieu',{
        data:data,
        user:emailGlobal,
        message1:req.flash('loginMessage'),
        message2:req.flash('signupMessage'),
        login:login
      });
    }
  })

});

router.post('/nhapdulieuExcel',isLoggedIn, function(req, res, next) {

  upload(req,res,function(err){
    if(err){
         res.json({error_code:1,err_desc:err});
         return;
    }
    /** Multer gives us file info in req.file object */
    if(!req.file){
        res.json({error_code:1,err_desc:"No file passed"});
        return;
    }
		var workbook = XLSX.readFile(req.file.path);

		var sheet_name_list = workbook.SheetNames;
		sheet_name_list.forEach(function(y) {
		    var worksheet = workbook.Sheets[y];
		    var headers = {};
		    var dataExcel = [];
		    for(z in worksheet) {
		        if(z[0] === '!') continue;
		        //parse out the column, row, and value
		        var tt = 0;
		        for (var i = 0; i < z.length; i++) {
		            if (!isNaN(z[i])) {
		                tt = i;
		                break;
		            }
		        };
		        var col = z.substring(0,tt);

		        var row = parseInt(z.substring(tt));

		        var value = worksheet[z].v;

		        //store header names
		        if(row == 1 && value) {
                value=value.replace(/ /g,'');
                value=value.replace('\n','');
		            headers[col] = value;
		            continue;
		        }
		        if(!dataExcel[row]) dataExcel[row]={};
		        dataExcel[row][headers[col]] = value;
		    }
		    //drop those first two rows which are empty
		    dataExcel.shift();
		    dataExcel.shift();

        //save to database
        for(i=0;i<dataExcel.length;++i){
          var lopTemp={
            tenlop:dataExcel[i].Khóa,
            maHP:dataExcel[i].Mãhọcphần,
            Tênlớphọcphần:dataExcel[i].Tênlớphọcphần,
            Sốlượng:dataExcel[i].Sốlượng,
            SốTC:dataExcel[i].SốTC,
            Phònghọc:dataExcel[i].Phònghọc,
            Giảngviên:dataExcel[i].Giảngviên,
            Cơquancôngtác:dataExcel[i].Cơquancôngtác,
            Điệnthoạiliênhệ:dataExcel[i].Điệnthoạiliênhệ,
            thu:null,
            tiet:null,
            thoiGianBatDau:null,
            thoiGianKetThuc:null,
            ghiChu:dataExcel[i].ghiChu
          }
          var sync=true;
          lop.findOne({tenlop:dataExcel[i].Khóa},function(err,result){
            if(err) {
              throw err;
              sync=false;
            }
            if(result){
              result.hoc.push(lopTemp);
              result.save(function(err) {
                if (err)throw err;
                console.log("đã tồn tại lớp", result.tenlop, "và đã thêm lớp học : ",lopTemp.Tênlớphọcphần);
                sync=false;
              });
            }else{
              var newLop= new lop();
              newLop.tenlop=dataExcel[i].Khóa;
              // newLop.batDauHocKy=Date.now();
              // newLop.ketThucHocKy=Date.now();
              // newLop.thoiGianTrongt7.sang.batDau=Date.now();
              // newLop.thoiGianTrongt7.sang.ketThuc=Date.now();
              // newLop.thoiGianTrongt7.chieu.batDau=Date.now();
              // newLop.thoiGianTrongt7.chieu.ketThuc=Date.now();
              // newLop.thoiGianTrongt7.toi.batDau=Date.now();
              // newLop.thoiGianTrongt7.toi.ketThuc=Date.now();
              // newLop.thoiGianTrongCn.sang.batDau=Date.now();
              // newLop.thoiGianTrongCn.sang.ketThuc=Date.now();
              // newLop.thoiGianTrongCn.chieu.batDau=Date.now();
              // newLop.thoiGianTrongCn.chieu.ketThuc=Date.now();
              // newLop.thoiGianTrongCn.toi.batDau=Date.now();
              // newLop.thoiGianTrongCn.toi.ketThuc=Date.now();
              newLop.hoc.push(lopTemp);
              newLop.save(function(err) {
                if (err)throw err;
                console.log('đã thêm lớp mới',newLop.tenlop);
                sync=false;
              });
            }

          })
          while(sync) {require('deasync').sleep(100);}
          if(i===dataExcel.length-1){
            res.render('nhapdulieuExcel',{
              gv:dataExcel,
              user:emailGlobal,
              message1:req.flash('loginMessage'),
              message2:req.flash('signupMessage'),
              login:login
            });
          }
        }
      });
  })
});

router.get('/xemlich',isLoggedIn, function(req, res, next) {

  // gv.findOne({'email':emailGlobal.local.email},function(err,result){
  //   if(err) throw err;
  //   if(result){
  //     var temp=result;
  //     res.render('xemlich',{
  //       data:temp,
  //       user:emailGlobal,
  //       message1:req.flash('loginMessage'),
  //       message2:req.flash('signupMessage'),
  //       login:login
  //     });
  //   }
  // });

  var lopAll,dslop=[];
  var sync=true;
  lop.find({},function(err,result){
    if(err) throw err;
    if(result){
      lopAll=result;
      sync=false;
    }
  })
  while(sync) {require('deasync').sleep(100);}
  var sync=true;
  console.log(emailGlobal.local);
  for(i=0;i<lopAll.length;++i){
    for(j=0;j<lopAll[i].hoc.length;++j){
      if(lopAll[i].hoc[j].Điệnthoạiliênhệ==emailGlobal.local.email){
        dslop.push(lopAll[i].hoc[j]);
      }
    }
  }
  while(sync) {require('deasync').sleep(100);}
  res.render('xemlich',{
    data:dslop,
    user:emailGlobal,
    message1:req.flash('loginMessage'),
    message2:req.flash('signupMessage'),
    login:login
  });

});

router.post('/goiYLich',isLoggedIn, function(req, res, next) {
  console.log("req goiYLich",req.body);
  var sync1=true,sync2=true,lopTrong,gvTrong,soTiet=req.body.sotc*45;
  var goiY={};
  lop.findOne({'tenlop':req.body.khoa},function(err,result){
    if(err) throw err;
    if(result){
      lopTrong={
        thoiGianTrongt7:result.thoiGianTrongt7,
        thoiGianTrongCn:result.thoiGianTrongCn
      };
      sync1=false;
    }
  });

  user.findOne({'local.email':req.body.sdt},function(err,result){
    if(err) throw err;
    if(result){
      gvTrong={
        thoiGianTrongt7:result.thoiGianTrongt7,
        thoiGianTrongCn:result.thoiGianTrongCn
      };
      sync2=false;
    }
  });

  while(sync1||sync2) {require('deasync').sleep(100);}

  //handle thoi gian trong cua ca hai va dua ra goi y.

  var rangeGv=moment.range(gvTrong.thoiGianTrongt7.sang[0].batDau,gvTrong.thoiGianTrongt7.sang[0].ketThuc);
  var rangeLop=moment.range(lopTrong.thoiGianTrongt7.sang[0].batDau,lopTrong.thoiGianTrongt7.sang[0].ketThuc);
  var giao=rangeGv.intersect(rangeLop);

  soTuan6tiet=ceil(sotiet/6);
  soTuan4tieu=ceil(sotiet/4);
  soTuanCaNgay=ceil(sotiet/)
  //hàm chuyển từ số tuần sang tháng để cộng vào giao.start
  function tuanToDate(tuan){
    //chỉ có tháng và ngày do một kỳ chỉ có 4 tháng
  }
  // chi sang hoăc chieu thu 7 hoac chu nhat thi thoi gian se la giao.start+tuanToDate(soTuan6tiet)

  // Ca ngay thu bay hoac ca ngay chu nhat thi thoi gian se la giao.start+ tuantoDate


  res.json({
    'gvTrong':gvTrong,
    'lopTrong':lopTrong
  })
});

router.post('/nhapthoigian',isLoggedIn,function(req,res,next){
  var sync=true;
  var batDau=new Date(req.body.batDauHocKy);
  var ketThuc=new Date(req.body.ketThucHocKy);

    user.update(
      {},
      {
        batDauHocKy:batDau,
        ketThucHocKy:ketThuc,
        thoiGianTrongt7:{
          sang:{
            batDau:batDau,
            ketThuc:ketThuc
          },
          chieu:{
            batDau:batDau,
            ketThuc:ketThuc
          },
          toi:{
            batDau:batDau,
            ketThuc:ketThuc
          }
        },
        thoiGianTrongCn:{
          sang:{
            batDau:batDau,
            ketThuc:ketThuc
          },
          chieu:{
            batDau:batDau,
            ketThuc:ketThuc
          },
          toi:{
            batDau:batDau,
            ketThuc:ketThuc
          }
        }
      },
      {multi:true},
      function(err,result){
        if(err) throw err;
        if(result){
          console.log("Cap nhat thoi gian hoc ky thanh cong cho user");
        }
      }
    );

    lop.update(
      {},
      {
        batDauHocKy:batDau,
        ketThucHocKy:ketThuc,
        thoiGianTrongt7:{
          sang:{
            batDau:batDau,
            ketThuc:ketThuc
          },
          chieu:{
            batDau:batDau,
            ketThuc:ketThuc
          },
          toi:{
            batDau:batDau,
            ketThuc:ketThuc
          }
        },
        thoiGianTrongCn:{
          sang:{
            batDau:batDau,
            ketThuc:ketThuc
          },
          chieu:{
            batDau:batDau,
            ketThuc:ketThuc
          },
          toi:{
            batDau:batDau,
            ketThuc:ketThuc
          }
        }
      },
      {multi:true},
      function(err,result){
        if(err) throw err;
        if(result){
          console.log("Cap nhat thoi gian hoc ky thanh cong cho lop ");
        }
      }
  );

  lop.find({},function(err,result){
    if(err) throw err;
    if(result){
      data=result;
      res.render('nhapdulieu',{
        data:data,
        user:emailGlobal,
        message1:req.flash('loginMessage'),
        message2:req.flash('signupMessage'),
        login:login
      });
    }
  })
});

router.get('/dangkylich',isLoggedIn, function(req, res, next) {
  var lopAll,dslop=[];
  var sync=true;
  lop.find({},function(err,result){
    if(err) throw err;
    if(result){
      lopAll=result;
      sync=false;
    }
  })
  while(sync) {require('deasync').sleep(100);}
  var sync=true;
  for(i=0;i<lopAll.length;++i){
    for(j=0;j<lopAll[i].hoc.length;++j){
      if(lopAll[i].hoc[j].Điệnthoạiliênhệ==emailGlobal.local.email){
        dslop.push(lopAll[i].hoc[j]);
      }
    }
    sync=false;
  }
  while(sync) {require('deasync').sleep(100);}
  res.render('dangkylich',{
    data:dslop,
    user:emailGlobal,
    message1:req.flash('loginMessage'),
    message2:req.flash('signupMessage'),
    login:login
  });
  lop.find({'email':emailGlobal.local.email},function(err,result){
    if(err) throw err;
    if(result){
      var temp=result;

    }
  })

});

module.exports = router;

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    login=true;
    return next();
  }
  res.redirect('/');
}
