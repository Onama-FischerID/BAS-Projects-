jQuery.sap.require("sap.ui.commons.FileUploader");
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/ODataModel",
    "sap/ui/export/Spreadsheet"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,JSONModel,ODataModel,Spreadsheet) {
        "use strict";

        var oView,obtn_upload, oFileuploader,oModel,oTable,oBusy,oThis;
        var sUrl = "/sap/opu/odata/sap/ZHAPPAY_CARDS_SRV/";

        return Controller.extend("zhappay.controller.View1", {
            onInit: function () {
                oThis = this;
                oView = this.getView();
                oFileuploader = oView.byId("fileUploader");
                oTable = oView.byId("table0");
                oTable.setVisible(false);
                oBusy = oView.byId("busy");
                oModel = new ODataModel(sUrl, true);
                oModel.setUseBatch(false);
                oModel.getSecurityToken();
            },
            fnUploadFile: function(){
                var file = jQuery.sap.domById("application-ZHAPPAY_CARD-display-component---View1--fileUploader-fu").files[0];
                try {
                    if (file) {
                        var filename = file.name;
                        var url = sUrl+ "FileSet('"+filename+"')/$value";
                        var oHeaders = {
                            "x-csrf-token" :oModel.getSecurityToken(),
                            "slug" : "QF"
                        };
                        oBusy.open();
                        jQuery.ajax({
                            type: 'PUT',
                            url: url,
                            headers: oHeaders,
                            cache: false,
                            contentType: file.type,
                            processData: false,
                            data: file,
                            success: function(data){  
                                console.log("Uploaded");                
                                oThis.fnUploadComplete();
                            },
                            error:function(data){
                                console.log("Not Uploaded");
                                oThis.fnUploadComplete();
                            }
                          });
                    }
                }
                catch(oException) {
                    console.log("File Issue");
                }
            },
            fnUploadComplete: function(){
                var sEntitySet = "ResponseSet";
                oModel.read(sEntitySet, {
					success: function(oData, response) {
						if (oData.results !== "undefined" || oData.results !== null) {
							var oJson = new JSONModel({
								"responseModel" : oData.results
							});
                            oTable.setVisible(true);
							oTable.setModel(oJson, "response");
                            oBusy.close();
						}
					},
					error: function(oError) {
                        oBusy.close();
					}
				});
            },
            fnDownload:function(){
                    var aCols = [];
                    var oRowBinding, oSettings, oSheet;
                    // var EdmType = exportLibrary.EdmType;
                    aCols.push({
                        label: "Sequence No",
                        property: "SeqNo",
                        type: "string"
                    });
        
                    aCols.push({
                        label: "Document Number",
                        property: "Doc",
                        type: "string"
                        
                    });
        
                    aCols.push({
                        label: "Company Code" ,
                        property: "CompCode" ,
                        type: "string"
                    });
        
                    aCols.push({
                        label: "Fiscal Year",
                        property: "FiscalYear",
                        type: "string"
                    });
        
                    aCols.push({
                        label: "Message Type",
                        property: "MsgType",
                        type: "string"
                    });
        
                    aCols.push({
                        label: "Description",
                        property: "Description",
                        type: "string"
                       
                    });
        
                    oRowBinding = oTable.getBinding("items");
                   
        
                    oSettings = {
                       
                        workbook: {
                            columns: aCols,
                           
                        },
                        dataSource: oRowBinding,
                        fileName: "Response.xlsx",
                        worker: true // We need to disable worker because we are using a MockServer as OData Service
                    };

                    oSheet = new Spreadsheet(oSettings);
			        oSheet.build().finally(function() {
				        oSheet.destroy();
			        });
            }
        });
    });
